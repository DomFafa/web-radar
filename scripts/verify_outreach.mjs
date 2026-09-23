import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {unstable_startWorker} from 'wrangler';
import {chromium} from '@playwright/test';
const artifacts='artifacts/outreach-review',origin='http://127.0.0.1:8796';
await mkdir(artifacts,{recursive:true});
const state=artifacts+'/state-'+Date.now();
execFileSync(process.execPath,['node_modules/wrangler/bin/wrangler.js','d1','migrations','apply','web-radar','--local','--env','test','--persist-to',state],{stdio:'pipe'});
let worker,browser;
try{
 worker=await unstable_startWorker({config:'wrangler.jsonc',env:'test',dev:{server:{hostname:'127.0.0.1',port:8796},persist:state,inspector:false,watch:false,logLevel:'error'}});await worker.ready;
 browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});
 const owner=await browser.newContext({viewport:{width:1440,height:1100}}), outsider=await browser.newContext();
 assert.equal((await owner.request.post(origin+'/api/auth/test-login',{data:{identity:'admin'}})).status(),200);
 assert.equal((await outsider.request.post(origin+'/api/auth/test-login',{data:{identity:'outsider'}})).status(),200);
 const api=async(path,method='GET',data,context=owner,expected=200)=>{const r=await context.request.fetch(origin+'/api/outreach'+path,{method,data});const text=await r.text();assert.equal(r.status(),expected,path+' '+text);return JSON.parse(text)};
 const suffix=Date.now();
 const group=await api('/contacts/groups','POST',{name:'Outreach '+suffix},owner,201);
 const contact=await api('/contacts','POST',{email:`test-${suffix}@example.com`,name:'Test customer',groupId:group.data.id},owner,201);
 const templates=await api('/templates');assert.ok(templates.data.length>0);
 const template=await api('/templates','POST',{name:'Verification '+suffix,subject:'Product introduction',bodyHtml:'<p>Hello {{name}}</p>'},owner,201);
 const campaign=await api('/campaigns','POST',{name:'Draft '+suffix,senderName:'Test sender',senderEmail:'sales@example.com',templateId:template.data.id},owner,201);
 await api(`/campaigns/${campaign.data.id}/recipients`,'POST',{contactIds:[contact.data.id]});
 const provider=await api('/providers','POST',{provider:'sendgrid',name:'Test provider '+suffix,apiKey:'test-only-not-a-real-key',config:{secret:'private-value'},isDefault:true},owner,201);
 const providers=await api('/providers');assert.ok(!JSON.stringify(providers).includes('test-only-not-a-real-key'));assert.ok(!JSON.stringify(providers).includes('private-value'));
 const job=await api('/site-messages','POST',{name:'Draft site message '+suffix,senderName:'Test sender',senderEmail:'sales@example.com',message:'Product inquiry',targets:['https://example.com/contact'],authorized:true},owner,201);
 for(const path of [`/contacts/${contact.data.id}`,`/templates/${template.data.id}`,`/campaigns/${campaign.data.id}`,`/site-messages/${job.data.id}`,`/providers/${provider.data.id}/domains`]) await api(path,'GET',undefined,outsider,404);
 await api('/campaigns','POST',{name:'Invalid cross workspace',senderName:'Test',senderEmail:'test@example.com',templateId:template.data.id},outsider,404);
 await api('/contacts','POST',{email:'foreign@example.com',groupId:group.data.id},outsider,404);
 assert.ok(!(await api('/providers','GET',undefined,outsider)).data.some(p=>p.id===provider.data.id));
 assert.equal((await browser.newContext()).request?true:false,true);
 const anon=await browser.newContext();assert.equal((await anon.request.get(origin+'/api/outreach/contacts')).status(),401);
 const page=await owner.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400&&r.url().includes('/api/outreach/'))errors.push(r.status()+' '+r.url())});
 await page.goto(origin+'/?view=edm');
 const nav=page.getByRole('navigation',{name:'工作台导航'});await nav.getByRole('button',{name:'EDM 邮件',exact:true}).waitFor();
 const tabs=page.getByRole('navigation',{name:'EDM 邮件功能'});
 for(const label of ['联系人','邮件模板','营销活动','服务商配置','发信域名','发送中心']){await tabs.getByRole('button',{name:label,exact:true}).click();await page.waitForTimeout(700);assert.ok(!(await page.locator('.outreach').innerText()).includes('内部服务器错误'));}
 await page.screenshot({path:artifacts+'/edm.png'});
 await nav.getByRole('button',{name:'站内信',exact:true}).click();await page.getByText('Draft site message '+suffix,{exact:true}).waitFor();await page.reload();await page.getByText('Draft site message '+suffix,{exact:true}).waitFor();
 await page.screenshot({path:artifacts+'/site-messages.png'});
 await page.setViewportSize({width:390,height:1000});await page.screenshot({path:artifacts+'/mobile.png'});
 assert.deepEqual(errors,[]);
 // Tests create drafts only: no external emails or website form submissions.
 console.log('PASS: authenticated navigation, contacts/groups, templates, campaign recipients, provider secret redaction, site-message drafts, reload recovery and cross-workspace denial. No live messages sent.');
}catch(error){if(browser){const p=browser.contexts()[0]?.pages()[0];if(p){await p.screenshot({path:artifacts+'/failure.png'}).catch(()=>{});await writeFile(artifacts+'/failure.txt',await p.locator('body').innerText()).catch(()=>{})}}throw error}finally{await browser?.close();await worker?.dispose()}
