"""Bounded, network-isolated rendering checks; never claims visual fidelity."""
import base64
import io
import os
import re
from typing import Any
from bs4 import BeautifulSoup
from PIL import Image, ImageChops, ImageStat
from playwright.async_api import async_playwright

WIDTHS = (390, 1440, 2560)

def validate_payload(value: Any) -> dict:
    if not isinstance(value, dict) or not isinstance(value.get('files'), dict) or not 1 <= len(value['files']) <= 10:
        raise ValueError('Expected 1–10 sampled HTML pages')
    if sum(len(html.encode()) for html in value['files'].values() if isinstance(html, str)) > 8*1024*1024:
        raise ValueError('HTML exceeds limit')
    for path, html in value['files'].items():
        if not isinstance(path, str) or '..' in path or not path.endswith('.html') or not isinstance(html, str):
            raise ValueError('Invalid page')
    for name in ('assets', 'references'):
        values=value.get(name,{})
        if not isinstance(values, dict) or len(values)>80:
            raise ValueError('Invalid image map')
        for key, data in values.items():
            if not isinstance(key,str) or not isinstance(data,str) or not re.fullmatch(r'data:image/(?:png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+',data):
                raise ValueError('Only embedded raster images are accepted')
            with Image.open(io.BytesIO(base64.b64decode(data.split(',',1)[1],validate=True))) as image:
                if image.width*image.height>40_000_000: raise ValueError('Image dimensions exceed limit')
                image.verify()
    return value

def render_html(html: str, assets: dict) -> str:
    for key, data in assets.items():
        html=html.replace('__WR_ASSET_'+key+'__',data)
    soup=BeautifulSoup(html,'html.parser')
    for node in soup.select('script,iframe,object,embed,base,meta[http-equiv],link'):
        node.decompose()
    for node in soup.find_all(True):
        for attr in list(node.attrs):
            if attr.lower().startswith('on') or attr in ('srcset','srcdoc'):
                del node[attr]
    for image in soup.select('img'): image['loading']='eager'
    if soup.head is None:
        raise ValueError('Missing document head')
    soup.head.insert(0,soup.new_tag('meta',attrs={'http-equiv':'Content-Security-Policy','content':"default-src 'none'; img-src data:; style-src 'unsafe-inline'; font-src data:; base-uri 'none'; form-action 'none'"}))
    return str(soup)

async def review(payload: dict) -> dict:
    payload=validate_payload(payload)
    records=[]; screenshots={}
    async with async_playwright() as playwright:
        executable=os.environ.get('PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH')
        browser=await playwright.chromium.launch(**({'executable_path':executable} if executable else {}))
        try:
            context=await browser.new_context(java_script_enabled=False,service_workers='block')
            await context.route('**/*',lambda route:route.abort())
            page=await context.new_page()
            for path, source in payload['files'].items():
                html=render_html(source,payload.get('assets',{}))
                for width in WIDTHS:
                    await page.set_viewport_size({'width':width,'height':1000})
                    await page.set_content(html,wait_until='load',timeout=8000)
                    # evaluate runs inspection only; page-authored scripts and all networking are disabled.
                    metrics=await page.evaluate('''() => ({scrollWidth:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight,brokenImages:[...document.images].filter(i=>!i.complete||!i.naturalWidth).length,headings:document.querySelectorAll('h1').length,textLength:document.body.innerText.trim().length})''')
                    issues=[];warnings=[]
                    if metrics['scrollWidth']>width+2: issues.append('页面横向溢出')
                    if metrics['brokenImages']: issues.append(f"{metrics['brokenImages']} 张图片无法显示")
                    if not metrics['textLength']: issues.append('没有可见正文')
                    if metrics['height']<=1000 and metrics['textLength']<400: warnings.append('内容较少，请检查是否需要补充产品、流程或联系信息')
                    if metrics['headings']!=1: warnings.append('建议每页保留一个明确的主标题')
                    png=await page.screenshot(full_page=False)
                    thumb=Image.open(io.BytesIO(png)).convert('RGB');thumb.thumbnail((640,640))
                    output=io.BytesIO();thumb.save(output,format='WEBP',quality=70)
                    screenshots[f'{path}@{width}']='data:image/webp;base64,'+base64.b64encode(output.getvalue()).decode()
                    score=None
                    reference=payload.get('references',{}).get(path)
                    if reference and width==1440:
                        raw=base64.b64decode(reference.split(',',1)[1],validate=True)
                        ref=Image.open(io.BytesIO(raw));ref.thumbnail((256,256))
                        # Thumbnail difference is a triage aid, not an acceptance score.
                        a=thumb.resize((128,128));b=ref.convert('RGB').resize((128,128))
                        score=round(sum(ImageStat.Stat(ImageChops.difference(a,b)).mean)/(3*255),4)
                    records.append({'path':path,'width':width,**metrics,'issues':issues,'warnings':warnings,'thumbnailDifference':score})
            await context.close()
        finally:
            await browser.close()
    return {'status':'issues' if any(r['issues'] for r in records) else 'passed','sampledPages':len(payload['files']),'widths':list(WIDTHS),'records':records,'screenshots':screenshots,'visuallyVerified':False}
