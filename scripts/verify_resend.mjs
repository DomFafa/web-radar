import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {unstable_startWorker} from 'wrangler';
import {chromium} from '@playwright/test';
const artifacts='artifacts/resend-review',origin='http://127.0.0.1:8796';
await mkdir(artifacts,{recursive:true});const state=artifacts+'/state-'+Date.now();
execFileSync(process.execPath,['node_modules/wrangler/bin/wrangler.js','d1','migrations','apply','web-radar','--local','--env','test','--persist-to',state],{stdio:'pipe'});
let worker,browser;
try{
 worker=await unstable_startWorker({config:'wrangler.jsonc',env:'test',dev:{server:{hostname:'127.0.0.1',port:8796},persist:state,inspector:false,watch:false,logLevel:'error'}});await worker.ready;
 browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});const context=await browser.newContext({viewport:{width:1440,height:1000}});
 assert.equal((await context.request.post(origin+'/api/auth/test-login',{data:{identity:'admin'}})).status(),200);
 const created=await context.request.post(origin+'/api/outreach/providers',{data:{provider:'resend',name:'Resend 测试帐号',apiKey:'re_test_not_real',isDefault:true}});assert.equal(created.status(),201);const id=(await created.json()).data.id;
 // UI requests are stubbed; this test never sends email or changes a remote account.
 const domain={id:'domain1',name:'example.com',status:'verified',region:'us-east-1',open_tracking:false,click_tracking:false,records:[{record:'DKIM',type:'TXT',name:'resend._domainkey',value:'p=test-only-dns-value',status:'verified'}]};
 let tracking=false,webhook=false;
 await context.route('**/api/outreach/providers/**/resend/**',async route=>{const url=route.request().url();let data;
 if(url.endsWith('/webhook')){webhook=true;data={message:'Resend 数据回调已连接',data:{connected:true}}}
 else if(url.endsWith('/tracking')){tracking=true;domain.open_tracking=domain.click_tracking=true;data={data:domain}}
 else data={data:url.endsWith('/domains')?[domain]:domain};
 await route.fulfill({json:data});});
 let failDomains=false;
 await context.route('**/api/outreach/providers/sender-domains',route=>route.fulfill({json:failDomains?{data:[],errors:[{providerName:'Resend',message:'帐号权限不足'}]}:{data:[{domain:'acfilter.net',providerId:id,providerType:'resend'},{domain:'oilsfilter.org',providerId:'mailchimp',providerType:'mailchimp'}],errors:[]}}));
 await context.request.post(origin+'/api/outreach/contacts',{data:{email:'browser-test@example.com',name:'Test'}});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(origin+'/?view=edm');const tabs=page.getByRole('navigation',{name:'EDM 邮件功能'});
 await page.getByText('尚未同步历史数据',{exact:false}).waitFor();
 let synced=false;await context.route('**/api/outreach/campaigns/stats/resend-sync',async route=>{synced=true;await route.fulfill({json:{success:true,data:{accounts:1}}})});
 await page.getByRole('button',{name:'同步 Resend 数据',exact:true}).click();assert.ok(synced);
 await page.screenshot({path:artifacts+'/tracking-overview-desktop.png'});
 await page.setViewportSize({width:390,height:1000});await page.screenshot({path:artifacts+'/tracking-overview-mobile.png'});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'tracking overview overflow');
 await page.setViewportSize({width:1440,height:1000});
 await tabs.getByRole('button',{name:'服务商配置',exact:true}).click();await page.getByRole('button',{name:'连接 / 检测数据回调',exact:true}).click();assert.ok(webhook);
 await page.getByRole('button',{name:'+ 添加配置',exact:true}).click();const modal=page.locator('.outreach .modal');await modal.getByText('Resend',{exact:true}).click();await modal.getByText(/填写 Resend API Key/).waitFor();await page.screenshot({path:artifacts+'/provider-desktop.png'});await modal.getByRole('button',{name:'×',exact:true}).click();
 await tabs.getByRole('button',{name:'发信域名',exact:true}).click();const panel=page.getByRole('region',{name:'Resend 帐号 Resend 测试帐号'});await panel.getByText('example.com',{exact:true}).waitFor();await panel.getByRole('button',{name:'检测域名 / DNS',exact:true}).click();await panel.getByText('resend._domainkey',{exact:true}).waitFor();await panel.getByRole('button',{name:'开启打开与点击追踪',exact:true}).click();await panel.getByRole('button',{name:'打开与点击追踪已开启',exact:true}).waitFor();assert.ok(tracking);
 await page.screenshot({path:artifacts+'/domains-desktop.png'});await page.setViewportSize({width:390,height:1000});await page.screenshot({path:artifacts+'/domains-mobile.png'});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'horizontal overflow');
 await page.setViewportSize({width:1440,height:1000});
 await tabs.getByRole('button',{name:'发送中心',exact:true}).click();
 await page.getByText('默认分组',{exact:true}).click();await page.getByRole('button',{name:'下一步',exact:true}).click();
 await page.getByRole('button',{name:'请选择模板',exact:false}).click();await page.locator('.sending-template-grid button').filter({has:page.locator('strong')}).first().click();
 const email=page.getByLabel('发件人邮箱 *',{exact:true}),select=page.getByLabel('已验证发信域名 *',{exact:true});
 await email.fill('re@acfilter.net');assert.equal(await select.locator('option').count(),3);
 await page.getByPlaceholder('reply@yourdomain.com').fill('support@reply.example');await select.selectOption('oilsfilter.org');assert.equal(await email.inputValue(),'re@oilsfilter.org');assert.equal(await page.getByPlaceholder('reply@yourdomain.com').inputValue(),'support@reply.example');
 await select.selectOption('acfilter.net');assert.equal(await email.inputValue(),'re@acfilter.net');
 await select.scrollIntoViewIfNeeded();await page.screenshot({path:artifacts+'/sender-domain-desktop.png'});
 await page.getByRole('button',{name:'下一步',exact:true}).click();await page.locator('h3').filter({hasText:'确认发送'}).waitFor();
 await page.getByRole('button',{name:'上一步',exact:true}).click();await page.setViewportSize({width:390,height:1000});
 await select.selectOption('oilsfilter.org');assert.equal(await email.inputValue(),'re@oilsfilter.org');await select.scrollIntoViewIfNeeded();await page.screenshot({path:artifacts+'/sender-domain-mobile.png'});
 failDomains=true;await page.getByRole('button',{name:'刷新发信域名',exact:true}).click();await page.getByText('Resend：帐号权限不足',{exact:true}).waitFor();assert.ok(await select.isDisabled());assert.equal(await select.locator('option').count(),1);assert.equal(await email.inputValue(),'re@oilsfilter.org');
 failDomains=false;await page.getByRole('button',{name:'刷新发信域名',exact:true}).click();await select.locator('option[value="acfilter.net"]').waitFor({state:'attached'});assert.equal(await email.inputValue(),'re@oilsfilter.org');
 assert.equal((await context.request.post(origin+'/api/outreach/webhooks/resend/'+id,{data:{type:'email.opened'}})).status(),401);
 assert.deepEqual(errors,[]);console.log('PASS Resend selection, setup guidance, account/domain/DNS display, tracking controls, mobile layout, unsigned webhook denial. No live mail sent.');
}finally{await browser?.close();await worker?.dispose()}
