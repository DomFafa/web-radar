import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
const origin='http://127.0.0.1:8788',id='af8c295b-48f0-487b-8796-19469e44d50b';
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
try{
 const context=await browser.newContext({viewport:{width:1536,height:1100}});
 await context.request.post(origin+'/api/auth/test-login',{data:{identity:'owner'}});
 const page=await context.newPage();await page.goto(origin+'/?project='+id+'&tab=clone-generate');
 await page.getByText('按设计稿直接重建的页面，未调用视觉模型。',{exact:false}).waitFor();
 const roles=await page.locator('.clone-editor select').evaluateAll(nodes=>nodes.map(n=>n.value));
 assert.equal(roles.filter(r=>r==='asset').length,8);assert.equal(roles.filter(r=>r==='catalog').length,1);
 await page.screenshot({path:'artifacts/clone-fidelity/editor-status.png',fullPage:true});
 await page.goto(origin+'/?project='+id+'&tab=publish');
 await page.getByRole('button',{name:'打开私有整站预览'}).click();
 const frame=page.frameLocator('.preview-overlay iframe');
 for(const value of ['home','catalog','about','contact','detail']){
  await page.getByLabel('预览页面').selectOption(value);
  await frame.locator('body').waitFor();
  await frame.locator('img').first().waitFor();
  await frame.locator('img').evaluateAll(async images=>Promise.all(images.map(img=>{img.loading='eager';return img.decode().catch(()=>{})})));
  const broken=await frame.locator('img').evaluateAll(images=>images.filter(i=>!i.naturalWidth).map(i=>i.getAttribute('src')));
  assert.deepEqual(broken,[],value);
 }
 await page.screenshot({path:'artifacts/clone-fidelity/private-preview.png'});
 console.log('Clone editor: 5 page references, 8 artwork assets; correct reconstruction provenance; all 5 private previews load their images.');
}finally{await browser.close()}
