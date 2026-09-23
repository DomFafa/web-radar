import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {unstable_startWorker} from 'wrangler';
import {chromium} from '@playwright/test';
const artifacts='artifacts/dashboard-20260923',origin='http://127.0.0.1:8795';
await mkdir(artifacts,{recursive:true});
const state=artifacts+'/state-'+Date.now();
execFileSync(process.execPath,['node_modules/wrangler/bin/wrangler.js','d1','migrations','apply','web-radar','--local','--env','test','--persist-to',state],{stdio:'pipe'});
let worker,browser;
try {
 worker=await unstable_startWorker({config:'wrangler.jsonc',env:'test',dev:{server:{hostname:'127.0.0.1',port:8795},persist:state,inspector:false,watch:false,logLevel:'error'}});await worker.ready;
 browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH});
 const context=await browser.newContext({viewport:{width:1440,height:1100}});await context.request.post(origin+'/api/auth/test-login',{data:{identity:'admin'}});
 const page=await context.newPage(),errors=[];let reads=0;page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(r.url().includes('/stats/overview'))reads++});
 const overview=async(path,expected=200,ctx=context)=>{const res=await ctx.request.get(origin+'/api/outreach/'+path+'/stats/overview');assert.equal(res.status(),expected);return res.json()};
 const email=await overview('campaigns'),sites=await overview('site-messages');assert.equal(email.data.totalSent,0);assert.equal(email.data.deliveryRate,null);assert.equal(sites.data.totalTargets,0);
 const anon=await browser.newContext();await overview('campaigns',401,anon);await overview('site-messages',401,anon);
 // Seed a draft only; no mail or website messages are sent.
 const created=await context.request.post(origin+'/api/outreach/site-messages',{data:{name:'Dashboard draft',senderName:'Test',senderEmail:'test@example.com',message:'Product inquiry for dashboard verification',targets:['https://example.com'],authorized:true}});assert.equal(created.status(),201,await created.text());
 const outsider=await browser.newContext();await outsider.request.post(origin+'/api/auth/test-login',{data:{identity:'outsider'}});assert.equal((await overview('site-messages',200,outsider)).data.totalJobs,0);
 await page.goto(origin);await page.getByRole('heading',{name:'控制台',exact:true}).waitFor();await page.waitForFunction(()=>!document.querySelector('.channel-summary[aria-busy="true"]'));
 const nav=page.getByRole('navigation',{name:'工作台导航'});assert.equal(await nav.locator('[aria-current="page"]').innerText(),'控制台');assert.equal(await page.locator('.channel-summary').count(),3);
 assert.ok((await page.getByRole('region',{name:'站内信概览'}).innerText()).includes('1'));
 const settledReads=reads;await page.waitForTimeout(5500);assert.equal(reads,settledReads,'terminal dashboard should not poll');
 await page.screenshot({path:artifacts+'/console-desktop.png',fullPage:true});
 await nav.getByRole('button',{name:'网站项目',exact:true}).click();await page.reload();await page.getByRole('heading',{name:'网站项目',exact:true}).waitFor();assert.ok(page.url().includes('view=projects'));
 await nav.getByRole('button',{name:'EDM 邮件',exact:true}).click();const tabs=page.getByRole('navigation',{name:'EDM 邮件功能'});assert.equal(await tabs.locator('[aria-current="page"]').innerText(),'数据概览');await page.getByRole('region',{name:'EDM 邮件概览'}).waitFor();assert.equal(await page.getByRole('region',{name:'EDM 邮件概览'}).evaluate(el=>getComputedStyle(el).paddingLeft),'24px');await page.screenshot({path:artifacts+'/edm-desktop.png',fullPage:true});
 await tabs.getByRole('button',{name:'发送中心',exact:true}).click();await page.reload();await page.getByRole('heading',{name:'发送中心',exact:true}).waitFor();await tabs.getByRole('button',{name:'数据概览',exact:true}).click();
 await nav.getByRole('button',{name:'站内信',exact:true}).click();await page.getByText('Dashboard draft',{exact:true}).waitFor();await page.waitForFunction(()=>!document.querySelector('.channel-summary[aria-busy="true"]'));await page.screenshot({path:artifacts+'/sites-desktop.png',fullPage:true});
 for(const width of [2560,390]){await page.setViewportSize({width,height:1000});for(const label of ['控制台','EDM 邮件','站内信']){await nav.getByRole('button',{name:label,exact:true}).click();await page.locator('.channel-summary').first().waitFor();await page.waitForFunction(()=>!document.querySelector('.channel-summary[aria-busy="true"]'));assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${label} overflow at ${width}`);await page.screenshot({path:`${artifacts}/${label}-${width}.png`,fullPage:true})}}
 await page.route('**/api/outreach/campaigns/stats/overview',route=>route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({message:'临时不可用'})}));await nav.getByRole('button',{name:'控制台',exact:true}).click();await page.getByRole('alert').filter({hasText:'临时不可用'}).waitFor();assert.ok(!(await page.getByRole('region',{name:'EDM 邮件概览'}).innerText()).includes('NaN'));
 await page.unroute('**/api/outreach/campaigns/stats/overview');await page.getByRole('button',{name:'刷新EDM 邮件概览统计'}).click();await page.getByRole('alert').filter({hasText:'临时不可用'}).waitFor({state:'detached'});
 assert.deepEqual(errors,[]);console.log('PASS: default console, explicit project/send routes survive reload, three workspace-scoped summaries, draft stats, anonymous denial, no idle polling, retry, empty ratios, 390/1440/2560 layouts. No live messages sent.');
}catch(e){if(browser){const p=browser.contexts()[0]?.pages()[0];if(p){await p.screenshot({path:artifacts+'/failure.png'});await writeFile(artifacts+'/failure.txt',await p.locator('body').innerText())}}throw e}finally{await browser?.close();await worker?.dispose()}
