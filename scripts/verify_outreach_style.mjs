import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {unstable_startWorker} from 'wrangler';
import {chromium} from '@playwright/test';
const artifacts='artifacts/outreach-style-20260923',origin='http://127.0.0.1:8795';
await mkdir(artifacts,{recursive:true});
const state=artifacts+'/state-'+Date.now();
execFileSync(process.execPath,['node_modules/wrangler/bin/wrangler.js','d1','migrations','apply','web-radar','--local','--env','test','--persist-to',state],{stdio:'pipe'});
let worker,browser;
try {
 worker=await unstable_startWorker({config:'wrangler.jsonc',env:'test',dev:{server:{hostname:'127.0.0.1',port:8795},persist:state,inspector:false,watch:false,logLevel:'error'}});await worker.ready;
 browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});
 const context=await browser.newContext({viewport:{width:1440,height:1050}});await context.request.post(origin+'/api/auth/test-login',{data:{identity:'admin'}});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(origin+'/?view=projects');await page.getByRole('heading',{name:'网站项目',exact:true}).waitFor();
 const native=await page.evaluate(()=>{const style=getComputedStyle(document.querySelector('.page-heading h1'));return {font:style.fontFamily,size:style.fontSize,weight:style.fontWeight,color:style.color}});
 await page.screenshot({path:artifacts+'/projects.png'});
 const nav=page.getByRole('navigation',{name:'工作台导航'});await nav.getByRole('button',{name:'EDM 邮件',exact:true}).click();await page.getByRole('heading',{name:'EDM 邮件',exact:true}).waitFor();
 assert.deepEqual(await page.locator('.outreach h1').evaluate(el=>{const s=getComputedStyle(el);return {font:s.fontFamily,size:s.fontSize,weight:s.fontWeight,color:s.color}}),native);
 const tabs=page.getByRole('navigation',{name:'EDM 邮件功能'});
 for (const [id,label] of [['send','发送中心'],['contacts','联系人'],['templates','邮件模板'],['campaigns','营销活动'],['providers','服务商配置'],['domains','发信域名'],['guide','使用指南']]) {
  await tabs.getByRole('button',{name:label,exact:true}).click();await page.waitForTimeout(300);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),label+' overflows');
  await page.screenshot({path:artifacts+'/'+id+'.png',fullPage:true});
 }
 await tabs.getByRole('button',{name:'邮件模板',exact:true}).click();await page.getByRole('button',{name:'➕ 新建模板',exact:true}).click();await page.locator('.ql-editor').waitFor();await page.screenshot({path:artifacts+'/template-editor.png'});await page.locator('.template-editor-modal').getByRole('button',{name:'✕',exact:true}).click();
 await nav.getByRole('button',{name:'站内信',exact:true}).click();assert.equal(await page.getByRole('heading',{name:'站内信',exact:true}).count(),1);await page.getByText('还没有站内信任务',{exact:true}).waitFor();await page.screenshot({path:artifacts+'/site-messages.png'});
 await page.getByRole('button',{name:'新建任务',exact:true}).click();await page.getByRole('heading',{name:'新建站内信任务',exact:true}).waitFor();await page.screenshot({path:artifacts+'/site-create.png'});await page.locator('.site-message-create-modal').getByTitle('关闭',{exact:true}).click();
 for(const width of [2560,390]) {
  await page.setViewportSize({width,height:1050});
  for(const section of ['EDM 邮件','站内信']) {
   await nav.getByRole('button',{name:section,exact:true}).click();
   if(section==='EDM 邮件')await tabs.getByRole('button',{name:'发送中心',exact:true}).click();
   await page.waitForTimeout(250);
   const bounds=await page.locator('.outreach').boundingBox();
   assert.ok(bounds.x+bounds.width<=width+1,'content exceeds viewport');
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'horizontal overflow '+section+' '+width);
   if(section==='EDM 邮件'){const card=await page.locator('.sending-center-card').boundingBox();assert.ok(Math.abs(card.x-bounds.x)<2,'send card is offset');assert.ok(Math.abs(card.width-bounds.width)<2,'send card width mismatch')}
   await page.screenshot({path:artifacts+'/'+(section==='EDM 邮件'?'send':'sites')+'-'+width+'.png',fullPage:true});
  }
 }
 assert.deepEqual(errors,[]);console.log('PASS: shared heading font/size/weight/color; all EDM pages, both modals, single site heading, aligned full-width content at 2560px, no overflow at 390px. No messages sent.');
}catch(e){if(browser){const p=browser.contexts()[0]?.pages()[0];if(p){await p.screenshot({path:artifacts+'/failure.png'});await writeFile(artifacts+'/failure.txt',await p.locator('body').innerText())}}throw e}finally{await browser?.close();await worker?.dispose()}
