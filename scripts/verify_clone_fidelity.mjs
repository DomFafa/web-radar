import { chromium } from '@playwright/test';
import { readFile, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const {project}=JSON.parse(await readFile('artifacts/clone-fidelity/after.json','utf8'));
const base='http://127.0.0.1:8788/public/sites/'+project.id;
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
const results=[];
try{
 const context=await browser.newContext({viewport:{width:1536,height:1024}});
 const page=await context.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const width of [1536,390]){
  await page.setViewportSize({width,height:1024});
  for(const [name,path] of Object.entries({home:'en/index.html',catalog:'en/products/index.html',about:'en/about/index.html',contact:'en/contact/index.html',detail:'en/products/'+project.draft.products[6].id+'/index.html'})){
   const response=await page.goto(base+'/'+path);assert.equal(response.status(),200);
   await page.locator('img').evaluateAll(async images=>{await Promise.all(images.map(img=>{img.loading='eager';return img.decode().catch(()=>{})}))});
   await page.screenshot({path:`artifacts/clone-fidelity/${name}-${width}.png`,fullPage:true});
   const data=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,images:[...document.images].filter(x=>!x.complete||x.naturalWidth===0).map(x=>x.src),privateImages:[...document.images].filter(x=>x.src.includes('/api/projects/')).map(x=>x.src),main:document.querySelector('main')?.getBoundingClientRect().toJSON(),hero:document.querySelector('.senseng-hero')?.getBoundingClientRect().toJSON(),cards:document.querySelector('.senseng-showcase-box')?.getBoundingClientRect().toJSON()}));
   results.push({name,width,...data});
   assert.equal(data.images.length,0,JSON.stringify(data.images));assert.equal(data.privateImages.length,0);assert.ok(data.scrollWidth<=width+1,`${name}/${width} overflow ${data.scrollWidth}`);
  }
 }
 // Anonymous user can navigate all pages without privileged preview APIs.
 await page.goto(base+'/en/index.html');await page.getByRole('link',{name:'Products',exact:true}).first().click();assert.ok(page.url().endsWith('/en/products/index.html'));
 await page.getByRole('link',{name:'View Details →',exact:true}).first().click();assert.ok(page.url().includes('/en/products/'));
 assert.deepEqual(errors,[]);
 await writeFile('artifacts/clone-fidelity/browser-results.json',JSON.stringify({results,errors},null,2));
 console.log(JSON.stringify({pages:results.length,errors,results},null,2));
}finally{await browser.close()}
