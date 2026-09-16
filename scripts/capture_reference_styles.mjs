import {chromium} from '@playwright/test';
import {writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const dir='public/templates/references';await mkdir(dir,{recursive:true});await mkdir('artifacts/template-reference-cache',{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
try{const page=await browser.newPage({viewport:{width:1440,height:1000}});await page.goto('https://junotoys.themerex.net/',{waitUntil:'domcontentloaded',timeout:60000});await page.waitForTimeout(5000);
const sheets=await page.evaluate(()=>[...document.styleSheets].flatMap(s=>{try{return s.href?[{url:s.href,text:[...s.cssRules].map(r=>r.cssText).join('\n')}]:[]}catch{return[]}}));
for(const s of sheets){const name=createHash('sha256').update(s.url).digest('hex').slice(0,20)+'.css';await writeFile(`${dir}/${name}`,s.text);await writeFile(`artifacts/template-reference-cache/${name}.raw`,s.text);}console.log('Captured browser-loaded styles:',sheets.map(s=>[s.url,s.text.length]));
}finally{await browser.close()}
