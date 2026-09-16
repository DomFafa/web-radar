import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
const refs=[
 ['saas-automation','https://automation-saas-tailwind.pixels71.workers.dev/'],
 ['fintech-platform','https://next-sass-html.pixels71.workers.dev/financial-management-platform'],
 ['digital-marketing','https://next-sass-html.pixels71.workers.dev/digital-marketing'],
 ['porto-accounting','https://www.okler.net/previews/porto/13.1.0/demo-accounting-1.html?colorPrimary=E8D8D9&colorSecondary=D90A2C&colorTertiary=4D4D4D&colorQuaternary=FDF1F3&showStyleSwitcher=true&hideStyleSwitcherAfterShow=true&addImagesSuffix=true&addURLParams=true'],
 ['crafto-corporate','https://craftohtml.themezaa.com/demo-corporate.html'],
 ['juno-toys','https://junotoys.themerex.net/'],
 ['corpox-ai-agency','https://html.inversweb.com/corpox/white-24-ai-agency.html'],
 ['corpox-consulting','https://html.inversweb.com/corpox/white-01-index-consulting.html']
];
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
try{for(let i=0;i<refs.length;i+=2)await Promise.all(refs.slice(i,i+2).map(async([id,url])=>{
 const dir=`artifacts/template-references/${id}`;await mkdir(dir,{recursive:true});
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 try{
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForTimeout(4500);
  await page.screenshot({path:`${dir}/first-screen.png`});
  await writeFile(`${dir}/source.html`,await page.content());
  for(let y=800;y<Math.min(await page.evaluate(()=>document.body.scrollHeight),14000);y+=800){await page.evaluate(y=>scrollTo(0,y),y);await page.waitForTimeout(120);}
  await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(800);
  await page.screenshot({path:`${dir}/full-page.png`,fullPage:true});
  const info=await page.evaluate(()=>({url:location.href,title:document.title,height:document.body.scrollHeight,bodyClass:document.body.className,
   stylesheets:[...document.querySelectorAll('link[rel=stylesheet]')].map(e=>e.href),
   videos:[...document.querySelectorAll('video,video source')].map(e=>({src:e.src,poster:e.poster,outer:e.outerHTML})),
   images:[...document.images].map(e=>({src:e.currentSrc||e.src,alt:e.alt,width:e.naturalWidth,height:e.naturalHeight,rect:{x:e.getBoundingClientRect().x,y:e.getBoundingClientRect().y,w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height}})),
   headings:[...document.querySelectorAll('h1,h2,h3')].map(e=>({text:e.innerText,tag:e.tagName,cls:e.className,size:getComputedStyle(e).fontSize,font:getComputedStyle(e).fontFamily,weight:getComputedStyle(e).fontWeight,line:getComputedStyle(e).lineHeight,color:getComputedStyle(e).color,rect:{x:e.getBoundingClientRect().x,y:e.getBoundingClientRect().y,w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height}})),
   backgrounds:[...document.querySelectorAll('*')].filter(e=>getComputedStyle(e).backgroundImage.includes('url(')).map(e=>({cls:e.className,image:getComputedStyle(e).backgroundImage})),
   bodyText:document.body.innerText
  }));
  await writeFile(`${dir}/inspection.json`,JSON.stringify(info,null,2));
  console.log(id,JSON.stringify({url:info.url,title:info.title,height:info.height,videos:info.videos.map(v=>v.src),headings:info.headings.slice(0,8).map(h=>h.text)}));
 }catch(e){console.log(id,'ERROR',e.message)}finally{await page.close();}
}));}finally{await browser.close();}
