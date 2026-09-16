import {chromium} from '@playwright/test';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {extname} from 'node:path';
const manifest=JSON.parse(await readFile('public/templates/references/sources.json','utf8'));
const urls=manifest.failed.map(x=>x[0]).filter(u=>u.includes('junotoys.themerex.net'));
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
try{const p=await browser.newPage();await p.goto('https://junotoys.themerex.net/',{waitUntil:'domcontentloaded',timeout:60000});await p.waitForTimeout(3000);
for(let i=0;i<urls.length;i+=4) await Promise.all(urls.slice(i,i+4).map(async url=>{try{const data=await p.evaluate(async url=>{const r=await fetch(url,{signal:AbortSignal.timeout(20000)});if(!r.ok)throw Error(String(r.status));const blob=await r.blob();return await new Promise(resolve=>{const f=new FileReader();f.onload=()=>resolve(f.result.split(',')[1]);f.readAsDataURL(blob)})},url);const filename=createHash('sha256').update(url).digest('hex').slice(0,20)+extname(new URL(url).pathname);await writeFile('public/templates/references/'+filename,Buffer.from(data,'base64'));console.log('Saved',url);}catch(e){console.log('Failed',url,e.message)}}));
}finally{await browser.close()}
