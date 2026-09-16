import { build } from 'esbuild';
import { chromium } from '@playwright/test';
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import sharp from 'sharp';
import assert from 'node:assert/strict';

const root = process.cwd(), output = resolve('artifacts/senseng-review');
await mkdir(output, { recursive: true });
await build({ stdin: {contents: "export {renderSite} from './src/templates/index';export {defaultDraft} from './src/worker/domain';",resolveDir:root}, bundle:true,platform:'node',format:'esm',outfile:resolve(output,'video-renderer.mjs') });
const {renderSite,defaultDraft} = await import(resolve(output,'video-renderer.mjs'));
const server=createServer(async(req,res)=>{
  try {
    const url=new URL(req.url,'http://localhost');
    if(url.pathname.startsWith('/templates/')) {
      const file=resolve('public','.'+url.pathname);
      if(!file.startsWith(resolve('public/templates')+'/'))throw Error();
      res.setHeader('Content-Type',({'.mp4':'video/mp4','.jpg':'image/jpeg','.png':'image/png'})[extname(file)] || 'application/octet-stream');
      res.end(await readFile(file));return;
    }
    const draft=defaultDraft();draft.template='senseng-video';draft.company.name='senseng';
    if(url.searchParams.has('custom')) draft.heroAssetId='hero-video.mp4';
    res.setHeader('Content-Type','text/html');
    res.end(renderSite(draft,{projectId:'video-edges',lang:'en',page:'home',preview:true,assetUrl:id=>'/templates/senseng/'+id,inquiryUrl:'/disabled'}));
  }catch{res.writeHead(404);res.end();}
});
await new Promise(r=>server.listen(4179,'127.0.0.1',r));
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
const page=await browser.newPage();
const results=[];
async function edgeRanges(buffer){
  const {data,info}=await sharp(buffer).removeAlpha().raw().toBuffer({resolveWithObject:true});
  return [2,info.width-3].map(x=>{
    const red=[];
    for(let y=Math.floor(info.height*.1);y<info.height*.85;y+=3)red.push(data[(y*info.width+x)*info.channels]);
    return Math.max(...red)-Math.min(...red);
  });
}
async function seek(time){
  await page.locator('video').evaluate(async(v,time)=>{v.pause();if(Math.abs(v.currentTime-time)>.001){const ready=new Promise(r=>v.addEventListener('seeked',r,{once:true}));v.currentTime=time;await ready;}},time);
}
try {
  for(const [width,height] of [[2546,1247],[5092,2494],[3440,1440],[390,844]]) {
    await page.setViewportSize({width,height});await page.goto('http://127.0.0.1:4179/');
    await page.waitForFunction(()=>document.querySelector('video').readyState>=2,undefined,{timeout:15000});
    const hero=page.locator('.senseng-hero-video-full');
    for(const time of [.25,5,10]) {
      await seek(time);
      // Prove the pixel check catches the old defect, despite a full-width element.
      if(width===2546 && time===5){
        await hero.evaluate(h=>h.classList.remove('senseng-hero-video-bundled'));
        const before=await edgeRanges(await hero.screenshot());
        assert.ok(before.every(range=>range<10),`expected original solid borders: ${before}`);
        results.push(`Reproduced encoded borders with original cover rule: edge red ranges ${before}.`);
        await hero.evaluate(h=>h.classList.add('senseng-hero-video-bundled'));
      }
      const screenshot=await hero.screenshot();
      const ranges=await edgeRanges(screenshot);
      assert.ok(ranges.every(range=>range>15),`${width}×${height} at ${time}s still has solid edges: ${ranges}`);
      results.push(`${width}×${height}, ${time}s: picture reaches both edges (red ranges ${ranges}).`);
      if(width===5092 && time===5)await writeFile(resolve(output,'video-wide-5092.png'),screenshot);
    }
  }
  await page.setViewportSize({width:2546,height:1247});await page.goto('http://127.0.0.1:4179/?custom');
  assert.equal(await page.locator('.senseng-hero-video-bundled').count(),0);
  const custom=await page.locator('video').evaluate(v=>({left:v.getBoundingClientRect().left,width:v.getBoundingClientRect().width,fit:getComputedStyle(v).objectFit}));
  assert.equal(custom.left,0);assert.equal(custom.width,2546);assert.equal(custom.fit,'cover');
  results.push('Custom videos retain ordinary cover without the bundled-video crop.');
  await writeFile(resolve(output,'video-edge-verification.txt'),results.join('\n')+'\n');
  console.log(results.join('\n'));
}finally{await browser.close();server.close();}
