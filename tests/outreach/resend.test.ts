import {afterEach,beforeEach,expect,test,vi} from 'vitest';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {createHmac} from 'node:crypto';
import {Hono} from 'hono';
import {d1} from './sqlite';
import {seal,decodeProvider} from '../../src/outreach/server/lib/credentials';
import {applyResendEvent,verifyResendSignature,listResendDomains} from '../../src/outreach/server/lib/resend';
import {providersRoutes} from '../../src/outreach/server/routes/providers.routes';
import {resendWebhookRoutes} from '../../src/outreach/server/routes/resend.routes';
import {handleEmailQueue} from '../../src/outreach/server/queues/email-send.queue';
vi.mock('../../src/outreach/server/lib/network',()=>({publicFetch:(...args:any[])=>globalThis.fetch(args[0],args[1])}));
let sqlite:DatabaseSync,env:any;
const secret='whsec_'+Buffer.from('test-webhook-signing-key').toString('base64');
const event=(type:string)=>({type:'email.'+type,created_at:new Date().toISOString(),data:{email_id:'email1',tags:{wr_recipient_id:'r'}}});
const row=()=>sqlite.prepare("SELECT * FROM edm_campaign_recipients WHERE id='r'").get()!;
const stats=()=>sqlite.prepare("SELECT * FROM edm_campaigns WHERE id='c'").get()!;
function signed(body:string){const time=String(Math.floor(Date.now()/1000)),id='msg_test';return {'svix-id':id,'svix-timestamp':time,'svix-signature':'v1,'+createHmac('sha256',Buffer.from(secret.slice(6),'base64')).update(`${id}.${time}.${body}`).digest('base64')};}
const app=(role='admin',user='u')=>{const h=new Hono<any>();h.use('*',async(c,next)=>{c.set('user',{id:user,role});await next()});h.route('/providers',providersRoutes);return h;};
beforeEach(async()=>{
 sqlite=new DatabaseSync(':memory:');for(const file of ['0007_outreach.sql','0008_resend_tracking.sql'])sqlite.exec(readFileSync('migrations/'+file,'utf8'));
 env={DB:d1(sqlite),CREDENTIAL_KEY:'test-key',BETTER_AUTH_SECRET:'test-auth',BETTER_AUTH_URL:'https://app.example.com'};
 sqlite.exec(`INSERT INTO edm_users(id,name,email,created_at,updated_at) VALUES ('u','Test','u@example.com',0,0),('other','Other','other@example.com',0,0);
 INSERT INTO edm_providers(id,user_id,provider,name,api_key,config,is_default,created_at,updated_at) VALUES ('p','u','resend','Test','unused','{}',1,0,0);
 INSERT INTO edm_contacts(id,user_id,email,created_at,updated_at) VALUES ('contact','u','customer@example.com',0,0);
 INSERT INTO edm_campaigns(id,user_id,name,sender_email,sender_name,status,created_at,updated_at) VALUES ('c','u','Campaign','sales@example.com','Test','sending',0,0);
 INSERT INTO edm_campaign_recipients(id,campaign_id,contact_id,status,created_at) VALUES ('r','c','contact','sending',0);
 INSERT INTO edm_resend_deliveries(recipient_id,provider_id,created_at) VALUES ('r','p',0);`);
 sqlite.prepare('UPDATE edm_providers SET api_key=?,config=?').run(await seal('re_test','p',env),await seal(JSON.stringify({resendWebhookSecret:secret}),'p:config',env));
 vi.stubGlobal('fetch',vi.fn(()=>{throw Error('Unexpected network request')}));
});
afterEach(()=>{vi.unstubAllGlobals();sqlite.close()});
test('Svix reference signature, tampering and replay expiry',async()=>{
 const body='{"event_type":"ping","data":{"success":true}}';const headers=new Headers({'svix-id':'msg_loFOjxBNrRLzqYUf','svix-timestamp':'1731705121','svix-signature':'v1,rAvfW3dJ/X/qxhsaXPOyyCGmRKsaKWcsNccKXlIktD0='});
 expect(await verifyResendSignature(body,headers,'whsec_plJ3nmyCDGBKInavdOK15jsl',1731705121000)).toBe(true);
 expect(await verifyResendSignature(body+' ',headers,'whsec_plJ3nmyCDGBKInavdOK15jsl',1731705121000)).toBe(false);
 expect(await verifyResendSignature(body,headers,'whsec_plJ3nmyCDGBKInavdOK15jsl',1731706000000)).toBe(false);
});
test('duplicate/out-of-order callbacks count unique engagement and preserve terminal outcomes',async()=>{
 for(const type of ['clicked','sent','opened','delivered','clicked','bounced','bounced','complained','complained','sent'])await applyResendEvent(env.DB,'p',event(type));
 expect(stats()).toMatchObject({total_sent:1,total_delivered:1,total_opened:1,total_clicked:1,total_bounced:1,total_complained:1});
 expect(row().status).toBe('bounced');expect(sqlite.prepare('SELECT subscription_status FROM edm_contacts').get()!.subscription_status).toBe('unsubscribed');
});
test('account and workspace isolation; mismatched email ids cannot claim a mapped recipient',async()=>{
 expect(await applyResendEvent(env.DB,'foreign',event('opened'))).toBe(false);
 await applyResendEvent(env.DB,'p',event('sent'));
 expect(await applyResendEvent(env.DB,'p',{...event('clicked'),data:{email_id:'other',tags:{wr_recipient_id:'r'}}})).toBe(false);
 sqlite.exec("UPDATE edm_providers SET user_id='other'");
 expect(await applyResendEvent(env.DB,'p',event('clicked'))).toBe(false);expect(stats().total_clicked).toBe(0);
});
test('authenticated callback resolves uncertain send but does not downgrade confirmed failure',async()=>{
 sqlite.exec("UPDATE edm_campaign_recipients SET status='failed',error_message='待核实：timeout'");
 await applyResendEvent(env.DB,'p',event('delivered'));expect(row()).toMatchObject({status:'delivered',error_message:null});
 await applyResendEvent(env.DB,'p',event('failed'));await applyResendEvent(env.DB,'p',event('sent'));
 expect(row()).toMatchObject({status:'failed',error_message:'Resend: email.failed'});
});
test('counter and recipient updates roll back together',async()=>{
 sqlite.exec("CREATE TRIGGER fail_recipient BEFORE UPDATE ON edm_campaign_recipients BEGIN SELECT RAISE(ABORT,'test'); END;");
 await expect(applyResendEvent(env.DB,'p',event('opened'))).rejects.toThrow('test');expect(stats().total_opened).toBe(0);
 expect(sqlite.prepare('SELECT email_id FROM edm_resend_deliveries').get()!.email_id).toBeNull();
});
test('webhook requires valid signature and acknowledges duplicates',async()=>{
 const body=JSON.stringify(event('opened')),url='https://app.example.com/api/outreach/webhooks/resend/p';
 expect((await resendWebhookRoutes.request(url,{method:'POST',body},env)).status).toBe(401);
 for(let i=0;i<2;i++)expect((await resendWebhookRoutes.request(url,{method:'POST',body,headers:signed(body)},env)).status).toBe(200);
 expect(stats().total_opened).toBe(1);
 const unknown=JSON.stringify({...event('sent'),data:{email_id:'unmapped'}});
 expect((await resendWebhookRoutes.request(url,{method:'POST',body:unknown,headers:signed(unknown)},env)).status).toBe(503);
});
test('domain pagination and actionable restricted-key error',async()=>{
 const mock=vi.fn().mockResolvedValueOnce(Response.json({data:[{id:'d1'}],has_more:true})).mockResolvedValueOnce(Response.json({data:[{id:'d2'}],has_more:false}));vi.stubGlobal('fetch',mock);
 expect(await listResendDomains('test')).toHaveLength(2);expect(String(mock.mock.calls[1][0])).toContain('after=d1');
 vi.stubGlobal('fetch',vi.fn().mockResolvedValue(Response.json({}, {status:403})));await expect(listResendDomains('test')).rejects.toThrow('Full access');
});
test('domain and tracking routes restrict writes and isolate workspaces',async()=>{
 const mock=vi.fn(async(url:any,init:any)=>Response.json(String(url).endsWith('/d1')?{id:'d1',name:'example.com',open_tracking:init?.method==='PATCH',records:[]}:{data:[]}));vi.stubGlobal('fetch',mock);
 expect((await app('admin','other').request('/providers/p/resend/domains',{},env)).status).toBe(404);
 expect((await app('member').request('/providers/p/resend/domains/d1/tracking',{method:'POST'},env)).status).toBe(403);
 expect(mock).not.toHaveBeenCalled();
 expect((await app().request('/providers/p/resend/domains/d1',{},env)).status).toBe(200);
 expect((await app().request('/providers/p/resend/domains/d1/tracking',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({openTracking:true,clickTracking:true})},env)).status).toBe(200);
 expect(mock.mock.calls.some(([,init])=>init?.method==='PATCH'&&JSON.parse(init.body).open_tracking)).toBe(true);
});
test('webhook registration reuses endpoint and stores signing secret encrypted and redacted',async()=>{
 const mock=vi.fn(async(url:any,init:any)=>Response.json(String(url).includes('?')?{data:[{id:'hook',endpoint:'https://app.example.com/api/outreach/webhooks/resend/p'}]}:{id:'hook',signing_secret:secret}));vi.stubGlobal('fetch',mock);
 expect((await app().request('/providers/p/resend/webhook',{method:'POST'},env)).status).toBe(200);
 expect(mock.mock.calls.some(([,init])=>init?.method==='POST')).toBe(false);
 const stored=sqlite.prepare('SELECT * FROM edm_providers').get()!;expect(stored.config).not.toContain(secret);
 expect((await decodeProvider({id:'p',apiKey:stored.api_key,config:stored.config} as any,env)).config).toContain(secret);
 expect(await (await app().request('/providers',{},env)).text()).not.toContain(secret);
});
test('Resend can replace existing email default without changing AI default',async()=>{
 sqlite.exec("INSERT INTO edm_providers(id,user_id,provider,name,api_key,is_default,created_at,updated_at) VALUES ('old','u','mailchimp','Old','fake',1,0,0),('ai','u','openai','AI','fake',1,0,0)");
 expect((await app().request('/providers/p',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({isDefault:true})},env)).status).toBe(200);
 expect(sqlite.prepare("SELECT is_default FROM edm_providers WHERE id='old'").get()!.is_default).toBe(0);expect(sqlite.prepare("SELECT is_default FROM edm_providers WHERE id='ai'").get()!.is_default).toBe(1);
});
for(const callback of ['clicked','failed'])test(`queue sends once and preserves an early ${callback} callback`,async()=>{
 const mock=vi.fn(async(url:any,init:any)=>{expect(url).toBe('https://api.resend.com/emails');expect(init.headers['Idempotency-Key']).toBe('wr-r');const payload=JSON.parse(init.body);expect(payload).toMatchObject({to:['customer@example.com'],subject:'Hello Sam',reply_to:'reply@example.com'});expect(payload.html).toContain('unsubscribe');expect(payload.tags).toEqual([{name:'wr_recipient_id',value:'r'}]);await applyResendEvent(env.DB,'p',event(callback));return Response.json({id:'email1'})});vi.stubGlobal('fetch',mock);
 const msg={body:{recipientId:'r',campaignId:'c',providerId:'p',toEmail:'customer@example.com',toName:'Sam',fromEmail:'sales@example.com',fromName:'Test',replyTo:'reply@example.com',subject:'Hello {{name}}',bodyHtml:'<p>Hello {{name}}</p>',bodyText:'Hello {{name}}',variables:{name:'Sam'}},ack:vi.fn(),retry:vi.fn()};
 await handleEmailQueue({messages:[msg]} as any,env);expect(msg.retry).not.toHaveBeenCalled();expect(row().status).toBe(callback);
 await handleEmailQueue({messages:[msg]} as any,env);expect(mock).toHaveBeenCalledTimes(1);expect(row().status).toBe(callback);
});
