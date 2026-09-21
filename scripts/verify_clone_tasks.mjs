import assert from 'node:assert/strict';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { unstable_startWorker } from 'wrangler';
import { chromium } from '@playwright/test';
const origin = 'http://127.0.0.1:8795';
await mkdir('artifacts/task-review', { recursive: true });
const statePath = 'artifacts/task-review/state';
execFileSync(process.execPath, ['node_modules/wrangler/bin/wrangler.js', 'd1', 'migrations', 'apply', 'web-radar', '--local', '--env', 'test', '--persist-to', statePath], { stdio: 'pipe' });
await writeFile('artifacts/task-review/index.png', Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a1e0AAAAASUVORK5CYII=', 'base64'));
let calls = 0,
  worker,
  browser;
const timers = new Set();
const connectionDomains = [], connectionRecords = [];
const referenceJpeg=await readFile('public/templates/senseng/products-1.jpg');
const referenceHtml='<html><head><style>body{margin:0;background:#eaf8ff}</style></head><body><h1>URL Reference</h1><img src="/hero.jpg"><a href="/about">About</a><a href="/contact">Contact</a><a href="/products">Products</a></body></html>';
let referenceSnapshots=0,referenceModelCalls=0;
try {
  worker = await unstable_startWorker({
    config: 'wrangler.jsonc',
    env: 'test',
    bindings: {
      CLOUDFLARE_ACCOUNT_ID: {type:'plain_text',value:'LOCAL_TEST'},
      CLOUDFLARE_API_TOKEN: {type:'secret_text',value:'isolated-reference-token'},
      CONNECTIONS_TEST_NETWORK: { type: 'plain_text', value: 'mock' },
      ASSET_SIGNING_KEY: { type: 'secret_text', value: 'isolated-credential-encryption-key' },
      CLOUDFLARE_HOSTING_ACCOUNTS: { type: 'secret_text', value: JSON.stringify([{accountId:'LOCAL_TEST',apiToken:'isolated-pages-token'}]) },
      OPENAI_API_KEY: { type: 'secret_text', value: 'isolated-test-key' },
      SITE_BUILDER_URL: { type: 'plain_text', value: 'https://renderer.test' },
      SITE_BUILDER_KEY: { type: 'secret_text', value: 'isolated-render-key' },
      CLONE_TEST_FIXTURE: { type: 'plain_text', value: 'false' },
      APP_ORIGIN: { type: 'plain_text', value: origin },
    },
    dev: {
      server: { hostname: '127.0.0.1', port: 8795 },
      persist: statePath,
      inspector: false,
      watch: false,
      logLevel: 'error',
      outboundService: async (request) => {
        if(new URL(request.url).hostname==='cloudflare-dns.com')return Response.json({Answer:[{type:1,data:'93.184.216.34'}]});
        if(new URL(request.url).hostname==='reference.example.com')return new URL(request.url).pathname==='/hero.jpg'?new Response(referenceJpeg,{headers:{'content-type':'image/jpeg'}}):new Response(referenceHtml,{headers:{'content-type':'text/html'}});
        if (new URL(request.url).hostname === 'api.cloudflare.com') {
          const u=new URL(request.url), method=request.method;
          const body=method==='POST'?await request.json():null;
          let result=[];
          if(u.pathname.endsWith('/browser-rendering/snapshot')){referenceSnapshots++;return Response.json({success:true,result:{content:referenceHtml,screenshot:referenceJpeg.toString('base64')}});}
          if(u.pathname.endsWith('/zones'))return Response.json({success:true,result:[{id:'zone-test',name:'example.test',status:'active',account:{id:'LOCAL_TEST',name:'Test account'}}],result_info:{total_pages:1}});
          if(u.pathname.endsWith('/dns_records')){if(method==='POST'){result={...body,id:'record-test'};connectionRecords.push(result);}else result=connectionRecords;}
          else if(u.pathname.endsWith('/dns_records/record-test')){connectionRecords.length=0;result={id:'record-test'};}
          else if(u.pathname.endsWith('/domains')){if(method==='POST'){result={...body,status:'pending'};connectionDomains.push(result);}else result=connectionDomains;}
          else if(u.pathname.includes('/domains/')){if(method==='DELETE')connectionDomains.length=0;result={status:'active'};}
          else throw Error('Unexpected Cloudflare fixture path');
          return Response.json({success:true,result});
        }
        // No external model requests. Exercise the actual worker + streaming parser against this isolated fixture.
        if (new URL(request.url).hostname === 'renderer.test') {
          assert.equal(new URL(request.url).pathname,'/v1/clone-quality');
          assert.equal(request.headers.get('authorization'),'Bearer isolated-render-key');
          const payload = await request.json();
          return Response.json({status:'passed',sampledPages:Object.keys(payload.files).length,widths:[390,1440,2560],records:Object.keys(payload.files).flatMap(path=>[390,1440,2560].map(width=>({path,width,height:1800,textLength:800,issues:[],warnings:[]}))),screenshots:{},visuallyVerified:false});
        }
        assert.equal(new URL(request.url).hostname, 'api.openai.com');
        calls++;
        const input = await request.json();
        assert.equal(input.stream, true);
      if (calls === 1) { assert.ok(input.messages[1].content[0].text.includes('SMART COMPLETION MODE')); assert.ok(input.messages[1].content[0].text.includes('保留第一屏，补充采购流程')); }
        const referenceContext=input.messages[1].content.find(item=>item.type==='text'&&item.text.includes('URL RECONSTRUCTION:'));
        let image='';
        if(referenceContext){referenceModelCalls++;assert.ok(referenceContext.text.includes('URL Reference'));const token=referenceContext.text.match(/__WR_ASSET_[^" ]+__/)[0];image=`<img alt="Imported reference hero" src="${token}">`;}
        const body = image+
          '<header>Test reference</header><main><h1>Persistent task test</h1><p>This mock provider only tests task behavior, not visual fidelity or a paid model.</p><form data-wr-inquiry><input aria-label="Preview email" type="email" name="email" required><button type="submit">Preview submit</button></form></main>';
        const content = JSON.stringify({
          css: 'body{margin:0}img{max-width:100%;height:auto}',
          pages: {
            en: Object.fromEntries(
              ['home', 'catalog', 'detail', 'about', 'contact'].map((k) => [k, body]),
            ),
          },
        });
        const chunks = content.match(/.{1,150}/gs);
        let index = 0,
          timer;
        return new Response(
          new ReadableStream({
            start(controller) {
              timer = setInterval(() => {
                const text = chunks[index++];
                controller.enqueue(
                  new TextEncoder().encode(
                    'data: ' +
                      JSON.stringify({
                        choices: [
                          {
                            delta: { content: text || '' },
                            finish_reason: index > chunks.length ? 'stop' : null,
                          },
                        ],
                      }) +
                      '\n\n',
                  ),
                );
                if (index > chunks.length) {
                  clearInterval(timer);
                  timers.delete(timer);
                  controller.close();
                }
              }, 600);
              timers.add(timer);
            },
            cancel() {
              clearInterval(timer);
              timers.delete(timer);
            },
          }),
          { headers: { 'Content-Type': 'text/event-stream' } },
        );
      },
    },
  });
  await worker.ready;
  browser = await chromium.launch({
    headless: true,
    ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH } : {}),
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1100 } });
  assert.equal(
    (
      await context.request.post(origin + '/api/auth/test-login', { data: { identity: 'owner' } })
    ).status(),
    200,
  );
  const created = await context.request.post(origin + '/api/projects', {
    data: {
      name: 'Persistent clone task regression',
      requestId: crypto.randomUUID(),
      buildBranch: 'clone',
    },
  });
  const { project } = await created.json();
  assert.ok(project?.id);
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const url = origin + '/?project=' + project.id + '&tab=clone-generate';
  await page.goto(origin+'/?project='+project.id+'&tab=basics');
  await page.getByLabel('公司 / 品牌名称',{exact:true}).fill('Form regression brand');
  await page.getByLabel('联系邮箱',{exact:true}).fill('sales@example.test');
  await page.getByLabel('业务类型',{exact:true}).selectOption('factory');
  await page.getByLabel('公司简介（选填）',{exact:true}).fill('Real products for wholesale buyers.');
  await page.locator('.company-strengths summary').click();
  await page.getByLabel('经营背景（选填）',{exact:true}).fill('Established in 2012');
  await page.getByLabel('资质与合规说明（选填）',{exact:true}).fill('Certification applies to the supplied product only.');
  await page.getByLabel('定制与交付能力（选填）',{exact:true}).fill('Packaging customization; lead time confirmed per order.');
  await page.getByText(/^已保存 · V/).waitFor();
  await page.waitForFunction(()=>!document.body.innerText.includes('待自动保存')&&!document.body.innerText.includes('保存中…'));
  await page.reload();
  assert.equal(await page.getByLabel('公司 / 品牌名称',{exact:true}).inputValue(),'Form regression brand');
  assert.equal(await page.getByLabel('业务联系人（选填）',{exact:true}).inputValue(),'');
  assert.equal(await page.getByLabel('业务类型',{exact:true}).inputValue(),'factory');
  await page.locator('.company-strengths summary').click();
  assert.equal(await page.getByLabel('经营背景（选填）',{exact:true}).inputValue(),'Established in 2012');
  await page.getByText('页面 Banner / 视频（选填，也可在预览后设置）',{exact:true}).click();
  const targetLabels=await page.locator('.banner-targets').innerText();
  assert.ok(targetLabels.includes('首页')&&targetLabels.includes('产品列表页')&&targetLabels.includes('关于页'));
  assert.ok(!targetLabels.includes('详情')&&!targetLabels.includes('产品：'));
  await page.locator('.company-fields').screenshot({path:'artifacts/task-review/company-form-desktop.png'});
  await page.setViewportSize({width:390,height:1100});
  await page.locator('.company-fields').screenshot({path:'artifacts/task-review/company-form-mobile.png'});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await page.setViewportSize({width:1440,height:1100});
  await page.goto(url);
  await page
    .locator('.clone-editor input[type=file]')
    .setInputFiles('artifacts/task-review/index.png');
  await page.getByText('已上传 1 个页面/素材文件').waitFor();
  assert.equal(await page.getByLabel('页面完善方式').inputValue(), 'smart');
  await page.locator('.clone-editor textarea').last().fill('保留第一屏，补充采购流程与联系方式。');
  assert.equal(await page.getByLabel('生成完成后自动发布').isChecked(),false);
  await page.getByLabel('生成完成后自动发布').check();
  await page.getByRole('button', { name: '🎯 生成并发布网站', exact: true }).click();
  const panel = page.getByRole('region', { name: '设计生成任务进度' });
  let statusRequests = 0;
  page.on('request', request => { const path = new URL(request.url()).pathname; if (request.method() === 'GET' && [`/api/projects/${project.id}`, `/api/projects/${project.id}/clone/task`].includes(path)) statusRequests++; });
  await panel.getByRole('button', { name: '暂停', exact: true }).waitFor();
  await panel.getByText(/已耗时/).waitFor();
  await page.reload();
  await panel.getByRole('button', { name: '暂停', exact: true }).waitFor();
  assert.ok((await panel.innerText()).includes('预计还需'));
  await panel.getByRole('button', { name: '暂停', exact: true }).click();
  await panel.getByRole('heading', { name: '任务已暂停', exact: true }).waitFor({ timeout: 45000 });
  await page.reload();
  await panel.getByRole('button', { name: '继续', exact: true }).waitFor();
  await panel.screenshot({ path: 'artifacts/task-review/paused-after-reload.png' });
  const callsBefore = calls;
  await panel.getByRole('button', { name: '继续', exact: true }).click();
  await panel.getByRole('link', { name: '打开网站 ↗' }).waitFor({ timeout: 45000 });
  assert.equal(calls, callsBefore);
  await panel.screenshot({ path: 'artifacts/task-review/completed.png' });
  await new Promise(resolve => setTimeout(resolve, 2500));
  const atCompletion = statusRequests;
  await new Promise(resolve => setTimeout(resolve, 8000));
  assert.equal(statusRequests, atCompletion, 'completed task and project must stop polling');
  await panel.getByRole('button', {name:'预览与发布管理'}).click();
  await page.getByRole('button',{name:'发布检查',exact:true}).click();
  assert.equal(await page.getByRole('button',{name:'当前内容已上线',exact:true}).isDisabled(), true);
  await page.getByRole('button',{name:'内容与预览',exact:true}).click();
  let inquiryRequests=0;
  page.on('request',request=>{if(request.method()==='POST'&&request.url().includes('/inquiries'))inquiryRequests++;});
  await page.getByRole('button',{name:'整站预览',exact:true}).click();
  const preview=page.frameLocator('iframe[title$="私有预览"]');
  await preview.getByLabel('Preview email').fill('buyer@example.com');
  await preview.getByRole('button',{name:'Preview submit'}).click();
  await preview.getByRole('status').filter({hasText:'No message was sent'}).waitFor();
  assert.equal(inquiryRequests,0);
  await page.getByRole('button',{name:'关闭预览',exact:true}).click();

  const latest = await (await context.request.get(origin+'/api/projects/'+project.id)).json();
  assert.equal(latest.releases.length,1);
  assert.equal(latest.project.draft.cloneConfig.generation.quality.status,'passed');
  const qualityReport=await context.request.get(origin+'/api/projects/'+project.id+'/clone/quality-report');
  assert.equal(qualityReport.status(),200);
  assert.deepEqual((await qualityReport.json()).widths,[390,1440,2560]);
  const duplicate = await context.request.post(origin+'/api/projects/'+project.id+'/publish',{data:{expectedVersion:latest.project.version,requestId:crypto.randomUUID()}});
  assert.equal(duplicate.status(),200);
  assert.equal((await (await context.request.get(origin+'/api/projects/'+project.id)).json()).releases.length,1);
  await page.goto(url);

  // A new run can be stopped while output is arriving, and stays stopped after reload.
  await page.getByRole('button', { name: '🔄 重新生成并发布', exact: true }).click();
  await panel.getByRole('button', { name: '停止', exact: true }).waitFor();
  await panel.getByRole('button', { name: '停止', exact: true }).click();
  await panel.getByRole('heading', { name: '任务已停止', exact: true }).waitFor();
  await page.reload();
  await panel.getByRole('heading', { name: '任务已停止', exact: true }).waitFor();
  await panel.screenshot({ path: 'artifacts/task-review/stopped-after-reload.png' });
  // Preview-only generation must save the result without creating another deployment.
  await page.getByLabel('生成完成后自动发布').uncheck();
  await page.getByRole('button', { name: '🔄 重新生成页面并预览', exact: true }).click();
  await panel.getByRole('heading', { name: '页面代码已生成，待预览与发布', exact: true }).waitFor({ timeout: 45000 });
  assert.equal((await (await context.request.get(origin+'/api/projects/'+project.id)).json()).releases.length, 1);
  assert.equal(await panel.getByRole('link', { name: '打开网站 ↗' }).count(), 0);
  await new Promise(resolve => setTimeout(resolve, 2500));
  const afterPreview = statusRequests;
  await new Promise(resolve => setTimeout(resolve, 6000));
  assert.equal(statusRequests, afterPreview, 'preview-only completion must stop polling');
  // Replace an already generated website banner without making another model call.
  await page.goto(origin+'/?project='+project.id+'&tab=publish');
  const bannerPanel=page.locator('.banner-editor');
  const modelCallsBeforeBanner=calls;
  await bannerPanel.locator('input[type=file]').setInputFiles('public/templates/senseng/hero-right.jpg');
  await bannerPanel.getByLabel('展示方式',{exact:true}).waitFor();
  await bannerPanel.getByLabel('展示方式',{exact:true}).selectOption('image');
  await bannerPanel.getByLabel('图片 1 的说明（Alt）',{exact:true}).fill('Uploaded Senseng product display');
  await page.getByRole('button',{name:'发布检查',exact:true}).click();
  await page.getByRole('button',{name:'保存并检查 SEO',exact:true}).click();
  await page.locator('.seo-panel').getByText(/已检查/).waitFor();
  await page.reload();
  assert.equal(await bannerPanel.getByLabel('展示方式',{exact:true}).inputValue(),'image');
  await bannerPanel.screenshot({path:'artifacts/task-review/banner-editor-desktop.png'});
  await page.getByRole('button',{name:'整站预览',exact:true}).click();
  const bannerFrame=page.frameLocator('iframe[title$="私有预览"]');
  await bannerFrame.locator('[data-wr-banner-image]').waitFor();
  assert.equal(await bannerFrame.locator('[data-wr-banner-image]').getAttribute('alt'),'Uploaded Senseng product display');
  assert.equal(await bannerFrame.locator('[data-wr-banner-image]').evaluate(img=>img.complete&&img.naturalWidth>0),true);
  await page.screenshot({path:'artifacts/task-review/banner-preview.png'});
  await page.getByRole('button',{name:'关闭预览',exact:true}).click();
  await page.setViewportSize({width:390,height:1100});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await bannerPanel.screenshot({path:'artifacts/task-review/banner-editor-mobile.png'});
  await page.setViewportSize({width:1440,height:1100});
  assert.equal(calls,modelCallsBeforeBanner);
  await page.getByRole('button',{name:'发布检查',exact:true}).click();
  await page.getByRole('button',{name:'保存并检查 SEO',exact:true}).click();
  await page.locator('.seo-panel').getByText(/已检查/).waitFor();
  await page.locator('.seo-panel').screenshot({path:'artifacts/task-review/seo-report.png'});
  await page.getByRole('button',{name:'内容与预览',exact:true}).click();
  const bannerDraft=(await (await context.request.get(origin+'/api/projects/'+project.id)).json()).project.draft;
  const layoutPage=await context.newPage();
  await layoutPage.goto(origin);
  for(const template of ['natural','technology','explorer','senseng-clean','senseng-video','saas-automation','fintech-platform','digital-marketing','porto-accounting','crafto-corporate','juno-toys','corpox-ai-agency','corpox-consulting']){
    const result=await context.request.post(origin+'/api/projects/'+project.id+'/preview?lang=en&page=home',{data:{draft:{...bannerDraft,template,banners:bannerDraft.banners.map(b=>({...b,mode:'background'}))}}});
    assert.equal(result.status(),200,template);
    const {html}=await result.json();
    for(const width of [390,2560]){
      await layoutPage.setViewportSize({width,height:900});
      await layoutPage.setContent(html,{waitUntil:'domcontentloaded'});
      await layoutPage.locator('[data-wr-banner-image]').waitFor();
      const geometry=await layoutPage.locator('[data-wr-banner-image]').evaluate(img=>{
        const r=img.getBoundingClientRect(),h=img.parentElement.getBoundingClientRect();
        return {width:r.width,heroWidth:h.width,height:r.height,heroHeight:h.height,display:getComputedStyle(img).display,video:img.parentElement.querySelectorAll('video').length};
      });
      assert.ok(geometry.width>0&&geometry.height>0,template+' banner must be visible');
      assert.ok(Math.abs(geometry.width-geometry.heroWidth)<3,template+' banner must span its hero');
      assert.equal(geometry.video,0,template+' must not play its old video');
      assert.equal(await layoutPage.locator('[data-wr-banner=custom] #video-toggle').count(),0);
      if(['senseng-clean','senseng-video','saas-automation'].includes(template))await layoutPage.screenshot({path:`artifacts/task-review/banner-${template}-${width}.png`});
    }
  }
  await layoutPage.close();
  // A shared image carousel on inner pages, plus an independent full-screen homepage video.
  const firstGroup=bannerPanel.getByRole('article',{name:'Banner 配置 1',exact:true});
  await firstGroup.getByLabel('首页',{exact:true}).uncheck();
  await firstGroup.getByLabel('关于页',{exact:true}).check();
  await firstGroup.getByLabel('联系页',{exact:true}).check();
  await firstGroup.getByLabel('上传 Banner 图片（可多选）',{exact:true}).setInputFiles(['public/templates/senseng/products-1.jpg','public/templates/senseng/products-2.jpg']);
  await firstGroup.getByLabel('图片 3 的说明（Alt）',{exact:true}).waitFor();
  await firstGroup.getByLabel('轮播间隔（秒）',{exact:true}).selectOption('3');
  await bannerPanel.getByRole('button',{name:'添加 Banner 配置',exact:true}).click();
  const secondGroup=bannerPanel.getByRole('article',{name:'Banner 配置 2',exact:true});
  await secondGroup.getByLabel('首页',{exact:true}).check();
  await secondGroup.getByLabel('媒体类型',{exact:true}).selectOption('video');
  await secondGroup.getByLabel('文字可读性',{exact:true}).selectOption('dark');
  await secondGroup.getByLabel('上传背景视频',{exact:true}).setInputFiles('public/templates/senseng/hero-video.mp4');
  await secondGroup.getByLabel('替换背景视频',{exact:true}).waitFor({timeout:60000});
  await secondGroup.getByLabel('上传视频封面（建议）',{exact:true}).setInputFiles('public/templates/senseng/video-poster.jpg');
  await secondGroup.getByLabel('替换视频封面',{exact:true}).waitFor();
  await page.getByRole('button',{name:'发布检查',exact:true}).click();
  await page.getByRole('button',{name:'保存并检查 SEO',exact:true}).click();
  await page.locator('.seo-panel').getByText(/已检查/).waitFor();
  await page.reload();
  assert.equal(await secondGroup.getByLabel('媒体类型',{exact:true}).inputValue(),'video');
  await page.getByRole('button',{name:'整站预览',exact:true}).click();
  const mediaFrame=page.frameLocator('iframe[title$="私有预览"]');
  await mediaFrame.locator('[data-wr-banner-video]').waitFor();
  await mediaFrame.locator('[data-wr-banner-video]').evaluate(v=>new Promise(resolve=>{if(v.readyState>=2)return resolve(true);v.addEventListener('loadeddata',()=>resolve(true),{once:true});}));
  assert.equal(await mediaFrame.locator('[data-wr-banner-video]').evaluate(v=>v.muted&&v.videoWidth>0),true);
  await mediaFrame.getByRole('button',{name:'Pause banner',exact:true}).click();
  assert.equal(await mediaFrame.locator('[data-wr-banner-video]').evaluate(v=>v.paused),true);
  await page.screenshot({path:'artifacts/task-review/banner-video-preview.png'});
  await mediaFrame.getByRole('button',{name:'Play banner',exact:true}).click();
  assert.equal(await mediaFrame.locator('[data-wr-banner-video]').evaluate(v=>v.paused),false);
  await page.emulateMedia({reducedMotion:'reduce'});
  await mediaFrame.getByRole('button',{name:'Play banner',exact:true}).waitFor();
  assert.equal(await mediaFrame.locator('[data-wr-banner-video]').evaluate(v=>v.paused),true);
  await mediaFrame.getByRole('button',{name:'Play banner',exact:true}).click();
  assert.equal(await mediaFrame.locator('[data-wr-banner-video]').evaluate(v=>v.paused),false);
  await page.emulateMedia({reducedMotion:'no-preference'});
  const mediaDraft=(await (await context.request.get(origin+'/api/projects/'+project.id)).json()).project.draft;
  const videoPage=await context.newPage();
  await videoPage.goto(origin);
  for(const template of ['natural','senseng-clean','senseng-video','saas-automation']){
    const result=await context.request.post(origin+'/api/projects/'+project.id+'/preview?lang=en&page=home',{data:{draft:{...mediaDraft,template}}});
    assert.equal(result.status(),200);
    const {html}=await result.json();
    for(const width of [390,2560]){
      await videoPage.setViewportSize({width,height:900});
      await videoPage.setContent(html,{waitUntil:'domcontentloaded'});
      const geometry=await videoPage.locator('[data-wr-banner-video]').evaluate(v=>{
        const r=v.getBoundingClientRect();return {x:r.x,width:r.width,height:r.height,viewport:innerWidth,fit:getComputedStyle(v).objectFit};
      });
      assert.ok(Math.abs(geometry.x)<3&&Math.abs(geometry.width-geometry.viewport)<3,template+' video must cover full viewport width: '+JSON.stringify(geometry));
      assert.ok(geometry.height>=900,template+' video must cover viewport height');
      assert.equal(geometry.fit,'cover');
    }
  }
  await videoPage.close();
  await page.getByLabel('预览页面',{exact:true}).selectOption('about');
  await mediaFrame.locator('[data-wr-slide]').nth(2).waitFor();
  assert.equal(await mediaFrame.locator('[data-wr-slide]').count(),3);
  await page.mouse.move(0,0);
  await mediaFrame.locator('[data-wr-banner-status]').filter({hasText:'2 / 3'}).waitFor({timeout:8000});
  await mediaFrame.getByRole('button',{name:'Pause banner',exact:true}).click();
  const pausedSlide=await mediaFrame.locator('[data-wr-banner-status]').innerText();
  await page.mouse.move(0,0);
  await new Promise(resolve=>setTimeout(resolve,3300));
  assert.equal(await mediaFrame.locator('[data-wr-banner-status]').innerText(),pausedSlide);
  await mediaFrame.getByRole('button',{name:'Previous banner',exact:true}).click();
  assert.equal(await mediaFrame.locator('[data-wr-banner-status]').innerText(),'1 / 3');
  await mediaFrame.getByRole('button',{name:'Next banner',exact:true}).click();
  assert.equal(await mediaFrame.locator('[data-wr-banner-status]').innerText(),'2 / 3');
  await mediaFrame.getByRole('button',{name:'Previous banner',exact:true}).click();
  assert.equal(await mediaFrame.locator('[data-wr-banner-status]').innerText(),'1 / 3');
  await page.getByLabel('预览页面',{exact:true}).selectOption('contact');
  await mediaFrame.getByRole('button',{name:'Next banner',exact:true}).waitFor();
  assert.equal(await mediaFrame.locator('[data-wr-slide]').count(),3);
  await page.getByLabel('预览页面',{exact:true}).selectOption('catalog');
  await mediaFrame.locator('h1').waitFor();
  assert.equal(await mediaFrame.locator('[data-wr-banner=custom]').count(),0);
  await page.getByRole('button',{name:'关闭预览',exact:true}).click();
  await page.setViewportSize({width:390,height:1100});
  await secondGroup.screenshot({path:'artifacts/task-review/banner-config-video-mobile.png'});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await page.setViewportSize({width:1440,height:1100});
  assert.equal(calls,modelCallsBeforeBanner);


  // Real browser + worker checks for encrypted shared credentials and per-site connections.
  const adminContext=await browser.newContext({viewport:{width:1440,height:1100}});
  assert.equal((await adminContext.request.post(origin+'/api/auth/test-login',{data:{identity:'platform'}})).status(),200);
  const adminPage=await adminContext.newPage();
  await adminPage.goto(origin+'/?view=admin');
  await adminPage.getByText('添加 Cloudflare / Resend 账号',{exact:true}).click();
  const accountForm=adminPage.locator('.provider-account-form');
  await accountForm.getByLabel('服务',{exact:true}).selectOption('resend');
  await accountForm.getByLabel('账号名称').fill('Browser Resend '+project.id);
  await accountForm.getByLabel('Resend API Key').fill('re_isolated_fixture_never_sent');
  await accountForm.getByLabel('已验证的发信地址').fill('Site <hello@example.test>');
  await accountForm.getByRole('button',{name:'保存账号',exact:true}).click();
  const mailRow=adminPage.locator('.provider-account-row').filter({hasText:'Browser Resend '+project.id});
  await mailRow.getByRole('button',{name:'设为默认',exact:true}).click();
  await mailRow.getByText(/默认发信账号/).waitFor();
  await page.goto(origin+'/?project='+project.id+'&tab=publish');
  await page.getByRole('button',{name:'上线管理',exact:true}).click();
  const connections=page.locator('section.panel').filter({has:page.getByRole('heading',{name:'域名绑定与询盘邮件',exact:true})});
  const settingsRoot=origin+'/api/projects/'+project.id+'/connections';
  const saved=(await (await context.request.get(settingsRoot)).json()).accounts.find(a=>a.label==='Browser Resend '+project.id);
  assert.ok(saved&&!('secret' in saved)&&!('apiKey' in saved));
  await connections.getByLabel('询盘发信账号').selectOption(saved.id);
  await connections.getByText('网站发信账号已保存，仅影响新询盘。',{exact:true}).waitFor();
  await page.reload();
  await page.getByRole('button',{name:'上线管理',exact:true}).click();
  assert.equal(await connections.getByLabel('询盘发信账号').inputValue(),saved.id);
  await connections.getByLabel('域名',{exact:true}).selectOption('zone-test');
  assert.equal(await connections.getByLabel('Cloudflare 账号',{exact:true}).inputValue(),'environment-cloudflare:LOCAL_TEST');
  assert.equal((await (await context.request.get(settingsRoot)).json()).accounts.some(a=>a.scope==='environment'),true);
  await connections.getByText('使用新的 Cloudflare API Token',{exact:true}).click();
  await connections.getByLabel('账号名称').fill('Browser DNS');
  await connections.getByLabel('Cloudflare API Token',{exact:true}).fill('isolated-dns-token');
  await connections.getByRole('button',{name:'保存账号',exact:true}).click();
  await connections.getByText('账号已保存到本网站，可以选择域名绑定。',{exact:true}).waitFor();
  await connections.getByLabel('域名',{exact:true}).selectOption('zone-test');
  assert.notEqual(await connections.getByLabel('Cloudflare 账号',{exact:true}).inputValue(),'environment-cloudflare:LOCAL_TEST');
  await connections.getByLabel('Cloudflare 账号',{exact:true}).selectOption('environment-cloudflare:LOCAL_TEST');
  await connections.getByLabel('域名',{exact:true}).selectOption('zone-test');
  await connections.getByLabel('主机名',{exact:true}).fill('site-'+project.id.slice(0,8));
  await connections.getByRole('button',{name:'绑定域名',exact:true}).click();
  await connections.getByText('已生效',{exact:true}).waitFor();
  await page.reload();
  await page.getByRole('button',{name:'上线管理',exact:true}).click();
  await connections.getByText('已生效',{exact:true}).waitFor();
  await connections.screenshot({path:'artifacts/task-review/site-connections-desktop.png'});
  await page.setViewportSize({width:390,height:1100});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await connections.screenshot({path:'artifacts/task-review/site-connections-mobile.png'});
  page.once('dialog',dialog=>dialog.accept());
  await connections.getByRole('button',{name:'解绑',exact:true}).click();
  await connections.getByText('域名已解绑；仅清理本应用创建且未被修改的 DNS 记录。',{exact:true}).waitFor();
  assert.equal(connectionDomains.length,0);assert.equal(connectionRecords.length,0);
  await connections.getByLabel('询盘发信账号').selectOption('');
  await connections.getByText('网站发信账号已保存，仅影响新询盘。',{exact:true}).waitFor();
  assert.equal((await adminContext.request.delete(origin+'/api/admin/provider-accounts/'+saved.id)).status(),200);
  await adminContext.close();
  // Template media instructions cover every visible preset, with no new custom-AI entry.
  const templateResponse=await context.request.post(origin+'/api/projects',{data:{name:'Template media checklist',requestId:crypto.randomUUID(),buildBranch:'template'}});
  const templateProject=(await templateResponse.json()).project;
  await page.setViewportSize({width:1440,height:1100});
  await page.goto(origin+'/?project='+templateProject.id+'&tab=basics');
  await page.getByLabel('公司 / 品牌名称',{exact:true}).waitFor();
  assert.equal(await page.getByText('AI 智能深度定制',{exact:true}).count(),0);
  await page.goto(origin+'/?project='+templateProject.id+'&tab=template');
  await page.locator('.template-card').filter({has:page.getByRole('heading',{name:'经典工贸',exact:true})}).click();
  await page.locator('.template-media-guide').waitFor();
  assert.equal(await page.locator('.template-media-card').count(),19);
  assert.equal(await page.getByRole('button',{name:/切换为 AI/}).count(),0);
  await page.locator('.template-media-guide summary').click();
  assert.ok((await page.locator('.template-slot-sizes').innerText()).includes('1536 × 1024'));
  await page.locator('.template-media-guide').screenshot({path:'artifacts/task-review/template-media-desktop.png'});
  await page.locator('.template-card').filter({has:page.getByRole('heading',{name:'SaaS 智能自动化',exact:true})}).click();
  await page.getByRole('heading',{name:'SaaS 智能自动化 · 素材准备清单',exact:true}).waitFor();
  assert.ok((await page.locator('.template-media-guide').innerText()).includes('内置 1 段视频'));
  await page.setViewportSize({width:390,height:1100});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await page.locator('.template-media-guide').screenshot({path:'artifacts/task-review/template-media-mobile.png'});
  await page.locator('.template-card').first().screenshot({path:'artifacts/task-review/template-media-card-mobile.png'});
  // Only a URL is entered; screenshots, pages and images are collected automatically.
  await page.goto(origin);
  await page.getByRole('button',{name:'创建网站',exact:true}).click();
  const createDialog=page.getByRole('dialog');
  assert.equal(await createDialog.getByRole('radio').count(),2);
  assert.equal(await createDialog.getByText('AI 定制建站',{exact:true}).count(),0);
  await createDialog.getByRole('radio',{name:/网址 \/ 设计稿建站/}).check();
  await createDialog.getByLabel('参考网址',{exact:true}).fill('https://reference.example.com/');
  await createDialog.screenshot({path:'artifacts/task-review/url-create.png'});
  await createDialog.getByRole('button',{name:'创建并开始',exact:true}).click();
  await page.locator('.clone-editor').waitFor();
  const urlProjectId=new URL(page.url()).searchParams.get('project');
  assert.ok(urlProjectId);
  assert.equal(await page.getByLabel('参考网址',{exact:true}).inputValue(),'https://reference.example.com/');
  assert.equal(await page.getByLabel('页面完善方式').inputValue(),'faithful');
  assert.equal(await page.getByLabel('生成完成后自动发布').isChecked(),false);
  await page.getByRole('button',{name:'🎯 生成页面并预览',exact:true}).click();
  await panel.getByRole('heading',{name:'页面代码已生成，待预览与发布',exact:true}).waitFor({timeout:60000});
  assert.equal(referenceSnapshots,5);assert.equal(referenceModelCalls,1);
  let urlProject=(await(await context.request.get(origin+'/api/projects/'+urlProjectId)).json());
  assert.equal(urlProject.releases.length,0);assert.equal(urlProject.project.draft.company.name,'');
  assert.equal(urlProject.project.draft.cloneConfig.referenceCapture.assets.length,1);
  await page.reload();
  await page.getByText(/已自动采集/).waitFor();
  await panel.getByRole('button',{name:'预览与发布管理'}).click();
  await page.getByRole('button',{name:'打开私有整站预览',exact:true}).click();
  const referenceFrame=page.frameLocator('iframe[title$="私有预览"]');
  await referenceFrame.getByAltText('Imported reference hero').waitFor();
  assert.equal(await referenceFrame.getByAltText('Imported reference hero').evaluate(i=>i.complete&&i.naturalWidth>0),true);
  await page.screenshot({path:'artifacts/task-review/url-preview.png'});
  await page.getByRole('button',{name:'关闭预览',exact:true}).click();
  await page.getByRole('button',{name:'发布检查',exact:true}).click();
  assert.equal(await page.getByRole('button',{name:'发布网站',exact:true}).isDisabled(),true);
  await page.screenshot({path:'artifacts/task-review/url-publication-check.png'});
  assert.deepEqual(errors, []);
  console.log(
    'PASS: ten template media checklists match their layouts; mobile layout and two creation modes pass; custom AI entry points are hidden; URL-only creation automatically captures 5 desktop/mobile/main-page screenshots, imports media, calls mocked model once and stays private; publication requires brand/email; auto-save survives refresh; three publication workspaces and mobile preview controls pass; grouped company form saves/reloads with optional contact; Banner targets exclude product details; live streaming progress + ETA; reload while running/paused/stopped; pause checkpoint and resume without second model call; server-owned auto-publication; terminal polling stops; identical content reuses the release; smart-mode instructions are forwarded; Banner persists without model calls; 13 templates span their hero at 390/2560 px; multi-page carousel timing/pause and full-screen video playback/reduced motion/390+2560 widths pass; SEO audit and credential/domain controls pass.',
  );
} catch (error) {
  const page = browser?.contexts()[0]?.pages()[0];
  if (page) {
    await page.screenshot({ path: 'artifacts/task-review/failure.png', fullPage: true }).catch(() => {});
    await writeFile('artifacts/task-review/failure.txt', await page.locator('body').innerText()).catch(() => {});
    for (const frame of page.frames().slice(1)) await writeFile('artifacts/task-review/failure-frame.txt', await frame.content()).catch(() => {});
  }
  throw error;
} finally {
  for (const timer of timers) clearInterval(timer);
  await browser?.close();
  await worker?.dispose();
}
