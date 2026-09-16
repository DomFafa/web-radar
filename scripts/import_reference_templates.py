"""Build audited, script-free reference layouts and self-host their visual assets.
Sources are the user supplied reference URLs captured by capture_template_references.mjs.
Run this explicitly to refresh reference snapshots; rendering never downloads HTML.
"""
from pathlib import Path
from bs4 import BeautifulSoup, Comment
from urllib.parse import urljoin, urlparse
from urllib.request import Request, urlopen
from concurrent.futures import ThreadPoolExecutor
import hashlib,json,re,time,subprocess
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'public/templates/references';OUT.mkdir(parents=True,exist_ok=True)
RAW=ROOT/'artifacts/template-reference-cache';RAW.mkdir(parents=True,exist_ok=True)
def rawpath(p):return RAW/(p.name+'.raw')
CACHE={};FAIL=[]
def fetch(url):
    if url.startswith('data:') or not url.startswith(('http://','https://')):return url
    if url in CACHE:return CACHE[url]
    ext=Path(urlparse(url).path).suffix.lower()
    if ext not in ['.png','.jpg','.jpeg','.webp','.avif','.svg','.gif','.mp4','.woff','.woff2','.ttf','.eot','.css']:ext='.css' if 'fonts.googleapis' in url else '.bin'
    filename=hashlib.sha256(url.encode()).hexdigest()[:20]+ext
    dest=OUT/filename;local='/templates/references/'+filename;CACHE[url]=local
    if not dest.exists() and ext=='.css' and rawpath(dest).exists():dest.write_bytes(rawpath(dest).read_bytes())
    if not dest.exists():
      for attempt in range(2):
       try:
        if 'pixels71.workers.dev' in url:
         with urlopen(Request(url,headers={'User-Agent':'Mozilla/5.0'}),timeout=25) as response:Path(str(dest)+'.download').write_bytes(response.read())
        else:subprocess.run(['curl','-fLsS','--max-time','20',url,'-o',str(dest)+'.download'],check=True,capture_output=True)
        Path(str(dest)+'.download').replace(dest)
        if ext=='.css':rawpath(dest).write_bytes(dest.read_bytes())
        break
       except Exception as e:
        if attempt==1:FAIL.append([url,str(e)]);CACHE[url]=url;return url
        time.sleep(1)
    return local
URL_RE=re.compile(r'url\(\s*([\'"]?)(.*?)\1\s*\)',re.I)
def absolutize_css(css,base,download=False):
 def sub(m):
  val=m[2]
  if val.startswith(('data:','#')):return m[0]
  
  if '/templates/references/' in val:return 'url("/templates/references/'+val.split('/templates/references/',1)[1]+'")'
  if val.startswith('/templates/'):return m[0]
  u=urljoin(base,val)
  if css[max(0,m.start()-12):m.start()].strip().endswith('@import'):
   local=fetch(u)
   if local.startswith('/templates/'):
    p=ROOT/'public'/local.lstrip('/');raw=rawpath(p)
    p.write_text(absolutize_css(raw.read_text() if raw.exists() else p.read_text(),u))
   return 'url("'+local+'")'
  return 'url("'+(fetch(u) if download or 'mask-image' in u or re.search(r'\.(woff2?|ttf|eot)(\?|$)',u) else CACHE.get(u,u))+'")'
 css=URL_RE.sub(sub,css)
 def imp(m):
  u=urljoin(base,m[1]);local=fetch(u)
  if local.startswith('/templates/'):
   p=ROOT/'public'/local.lstrip('/');p.write_text(absolutize_css(p.read_text(),u))
  return '@import url("'+local+'");'
 return re.sub(r'@import\s+[\'"]([^\'"]+)[\'"]\s*;',imp,css)
def classes(n):return ' '.join(n.get('class',[]))
records={}
for d in sorted((ROOT/'artifacts/template-references').iterdir()):
 if not (d/'source.html').exists():continue
 id=d.name;j=json.loads((d/'inspection.json').read_text());url=j['url'];s=BeautifulSoup((d/'source.html').read_text(),'html.parser')
 # Only layout roots. No demo drawers, analytics, popups, or vendor scripts.
 selector={'porto-accounting':'.body','crafto-corporate':'.box-layout','juno-toys':'.body_wrap','corpox-ai-agency':'.page-wrapper','corpox-consulting':'.page-wrapper'}.get(id)
 root=s.select_one(selector) if selector else s.body
 for n in list(root.select('.navbar-modern-inner,.navbar-show-modern-bg,#theme-toggle,#theme-toggle-btn,.theme-toggle,script,noscript,iframe,object,embed,.tmp-megamenu,.popup-mobile-menu,.dropdown-menu,.dropdown-menu-bridge,.sub-menu,.search-form-wrapper,.header-search-icon,.theme-demos,.trx_demo_panels,.adp-popup,.menu_mobile,.sc_layouts_cart,.sc_layouts_search,.loading-overlay,.tp-loader,.tp-bannertimer,.rs-loader')):n.decompose()
 for n in list(root.select('aside.fixed')):n.decompose()
 for n in root.find_all(string=lambda t:isinstance(t,Comment)):n.extract()
 # Do not include template code, tracking links, source-site forms, or event handlers.
 for n in list(root.find_all(True)):
  if n.parent is None:continue
  for k in list(n.attrs):
   if k.startswith('on') or k in ['srcset','integrity','crossorigin','data-srcset','data-lazy-srcset']:del n[k]
  if n.name=='form':
   n.name='div';n.attrs.pop('action',None);n.attrs.pop('method',None);n['data-wr-reference-form']=''
   for c in n.select('input,select,textarea'):c['disabled']='';c['aria-label']=c.get('placeholder','Reference form')
   for c in n.select('button'):c.name='a';c['href']='__WR_CONTACT__';c['data-wr-page']='contact';c.attrs.pop('type',None)
  if n.get('aria-label') and n.has_attr('data-text-reveal'):
   n.string=n['aria-label'];n.attrs.pop('aria-label',None)
  if n.has_attr('data-ns-animate') or n.has_attr('data-appear-animation') or n.has_attr('data-anime'):
   sty=n.get('style','');sty=re.sub(r'(?:opacity|filter|visibility|animation-delay)\s*:[^;]+;?','',sty)
   if n.name!='header' and 'left-1/2' not in classes(n):sty=re.sub(r'(?:transform|translate|scale|rotate)\s*:[^;]+;?','',sty)
   n['style']=sty+';opacity:1;visibility:visible;filter:none;'
  if n.name=='a':
   href=n.get('href','');txt=n.get_text(' ',strip=True).lower()
   dest='about' if any(x in href.lower() for x in ['about','team','story']) else 'home' if txt=='home' else 'catalog' if any(x in (href+txt).lower() for x in ['product','shop','catalog','service','portfolio','pricing','collection']) else 'contact'
   n['href']='__WR_'+dest.upper()+'__';n['data-wr-page']=dest
   for k in ['target','download','onclick']:n.attrs.pop(k,None)
  if n.name=='video':
   n['autoplay']='';n['muted']='';n['loop']='';n['playsinline']='';n['preload']='metadata';n['id']='hero-video' if id=='saas-automation' else 'reference-video'
 # Replace each desktop nav list with the project's four routes; retain the source typography.
 for nav in root.select('header nav'):
  ul=nav.find('ul')
  if not ul:continue
  item=ul.find('li',recursive=False);a=item.find('a',recursive=False) if item else None
  if not a:continue
  li_class=[x for x in item.get('class',[]) if not any(y in x for y in ['active','dropdown','child','mega','open','current','page_item'])]
  a_class=[x for x in a.get('class',[]) if x not in ['active','current-page-active','sf-with-ul','dropdown-toggle']]
  ul.clear()
  for dest in ['home','catalog','about','contact']:
   li=s.new_tag('li',attrs={'class':li_class});link=s.new_tag('a',href='__WR_'+dest.upper()+'__',attrs={'class':a_class,'data-wr-page':dest});link.string='__WR_LABEL_'+dest.upper()+'__';li.append(link);ul.append(li)
 # Replace canvas/revolution heroes with responsive, first-party slide markup.
 if id=='crafto-corporate':
  old=root.select_one('#slider')
  slides=''.join('<div data-wr-slide'+(' hidden' if i>1 else '')+' style="background-image:url('+urljoin(url,f'images/demo-corporate-main-slider-0{i}.jpg')+')"><div class="wr-crafto-rings"></div><div class="wr-crafto-copy"><span>ON DEMAND LIVE SUPPORT</span><h1>__WR_HEADLINE__</h1><p>We’re a fully dedicated corporate service agency collaborating with brands all over the world.</p><a href="__WR_CONTACT__" data-wr-page="contact">Get started now</a></div><div class="wr-quality">✦<br>Decided quality</div></div>' for i in range(1,4))
  old.replace_with(BeautifulSoup('<section class="wr-crafto-hero" data-wr-slider>'+slides+'<button data-wr-prev aria-label="Previous slide">←</button><button data-wr-next aria-label="Next slide">→</button></section>','html.parser'))
 if id=='juno-toys':
  old=root.find('rs-fullwidth-wrap')
  slides=''.join('<div data-wr-slide'+(' hidden' if i>1 else '')+' style="background-image:url('+urljoin(url,old.select('rs-sbg')[i-1]['data-lazyload'])+')"><div class="wr-juno-copy"><h1>__WR_HEADLINE__</h1><p>We offer a premium service, whether you are shopping at one of our flagship stores or via our website!</p><a href="__WR_CATALOG__" data-wr-page="catalog">Shop now</a></div><img class="wr-juno-clouds" src="'+urljoin(url,'/wp-content/uploads/revslider/juno/juno-slide1-clouds.png')+'" alt=""></div>' for i in range(1,4))
  if old:old.replace_with(BeautifulSoup('<section class="wr-juno-hero" data-wr-slider>'+slides+'<button data-wr-prev aria-label="Previous slide">←</button><button data-wr-next aria-label="Next slide">→</button></section>','html.parser'))
 if id=='corpox-consulting':
  old=root.select_one('.banner-slider-area-one');originals=old.select('.slider-area')
  slides=[]
  for i,slide in enumerate(originals):
   slide['style']='';slide['class']=[x for x in slide.get('class',[]) if not x.startswith('slick')];slide['data-wr-slide']=''
   if i:slide['hidden']=''
   for h in slide.find_all('h1'):h.clear();h.append('__WR_HEADLINE__')
   slides.append(str(slide))
  old.clear();old['data-wr-slider']='';old['class']=['banner-slider-area-one','wr-consulting-hero']
  old.append(BeautifulSoup(''.join(slides)+'<button data-wr-prev aria-label="Previous slide">←</button><button data-wr-next aria-label="Next slide">→</button>','html.parser'))
 # Company branding replaces the source brand without changing surrounding geometry.
 for a in root.select('header a,footer a'):
  imgs=a.find_all('img')
  if imgs and any('logo' in (im.get('src','')+classes(im)).lower() for im in imgs):
   a.clear();a.append(BeautifulSoup('__WR_BRAND__','html.parser'));a['class']=a.get('class',[])+['wr-reference-brand'];a['href']='__WR_HOME__';a['data-wr-page']='home'
 # Bind the headline and introductory copy while retaining the reference line length.
 h=root.find('h1')
 if h and id not in ['juno-toys']:
  h.clear();h.append('__WR_HEADLINE__');h.attrs.pop('aria-label',None)
 # Freeze text/counters at their readable final state, never at an animation frame.
 for n in root.select('.tmp-title-split,.text-anime-style-2,.split-text,.splitted'):
  text=' '.join(n.get_text('',strip=False).split());n.clear();n.append(text)
 for n in root.select('.odometer[data-count],[data-to]'):
  value=n.get('data-count') or n.get('data-to')
  if value:n.clear();n.append(value)
 for n in root.select('.line-effect,.slick-cloned'):n.decompose()
 for n in root.select('.slick-track'):
  n['style']='';n['data-wr-carousel-track']=''
 for n in root.select('.slick-slide'):
  n['aria-hidden']='false';n.attrs.pop('tabindex',None)
 for n in root.select('.swiper-wrapper,.owl-stage'):
  n['style']=re.sub(r'transform:[^;]+;?', '',n.get('style',''))
 for n in root.select('.slider_wrap + div'):
  if 'height:650px' in n.get('style','').replace(' ',''):n.decompose()
 # Asset downloads are deduplicated across the eight templates.
 urls=set()
 for n in root.find_all(True):
  for attr in ['src','poster','data-src','data-lazyload','data-lazy']:
   v=n.get(attr)
   if v and not v.startswith(('data:','__WR_','#')):urls.add(urljoin(url,v))
  for m in URL_RE.finditer(n.get('style','')):
   if not m[2].startswith(('data:','#')):urls.add(urljoin(url,m[2]))
 for bg in j['backgrounds']:
  # Match actual retained classes; excludes mega-menu and demo UI backgrounds.
  if any(x in str(bg['cls']) for x in ['mega-top','trx_demo','form-control','btn-close']):continue
  for m in URL_RE.finditer(bg['image']):
   if not m[2].startswith('data:'):urls.add(urljoin(url,m[2]))
 with ThreadPoolExecutor(max_workers=10) as pool:list(pool.map(fetch,sorted(urls)))
 for n in root.find_all(True):
  for attr in ['src','poster','data-src','data-lazyload','data-lazy']:
   v=n.get(attr)
   if v and not v.startswith(('data:','__WR_','#')):n[attr]=CACHE.get(urljoin(url,v),urljoin(url,v))
  if n.has_attr('style'):n['style']=absolutize_css(n['style'],url)
  if n.name=='img':
   # Load real images even if the source relies on a lazy-loading plugin.
   if n.get('data-src') and (not n.get('src') or n.get('src','').startswith('data:')):n['src']=n['data-src']
   n['decoding']='async'
 # Original CSS, including inline theme/Elementor settings. No source JS is executed.
 css=[]
 for href in j['stylesheets']:
  if any(x in href for x in ['trx_demo','advanced-popups','style-switcher','/revolution/','/revslider/']):continue
  local=fetch(href)
  if local.startswith('/templates/'):
   p=ROOT/'public'/local.lstrip('/');raw=rawpath(p).read_text() if rawpath(p).exists() else p.read_text();raw=absolutize_css(raw,href);p.write_text(raw);css.append(local)
 inline='\n'.join(absolutize_css(n.get_text(),url) for n in s.head.find_all('style') if 'trx_demo' not in n.get('id',''))
 (OUT/(id+'.inline.css')).write_text(inline)
 css.append('/templates/references/'+id+'.inline.css')
 # Pick actual visual slots, avoiding logos, icons, avatars, and purely decorative layers.
 slot=[]
 dims={CACHE.get(im['src'],im['src']):im for im in j['images']}
 for im in root.select('img'):
  src=im.get('src','');info=dims.get(src,{})
  w,h=info.get('width',0),info.get('height',0)
  if w>=400 and h>=280 and 'logo' not in (info.get('src','')+classes(im)).lower() and not any(x in info.get('src','') for x in ['gradient','cloud','star','shape','slider','slide','bg-','background','avatar','team','author']):
   if len(slot)>=12:continue
   ix=len(slot);slot.append({'src':src,'alt':im.get('alt',''),'width':w,'height':h})
   im['src']='__WR_IMAGE_'+str(ix)+'__';im['alt']='__WR_ALT_'+str(ix)+'__';im['data-wr-product-slot']=str(ix);im['style']=im.get('style','')+f';aspect-ratio:{w}/{h};object-fit:contain;'
 for h in root.find_all('h1')[1:]:h.name='h2'
 body=str(root) if selector else ''.join(str(n) for n in root.contents)
 # SVG attribute case is significant in XML-style geometry; HTML parser lowercases it.
 body=body.replace('viewbox=','viewBox=').replace('preserveaspectratio=','preserveAspectRatio=')
 records[id]={'source':url,'bodyClass':j['bodyClass'],'htmlClass':' '.join(s.html.get('class',[])),'css':css,'html':body,'slots':slot}
 print(id,'html',len(body),'css',len(css),'product slots',len(slot),flush=True)
(ROOT/'src/templates/themes/referenceLayouts.ts').write_text('// Generated by scripts/import_reference_templates.py. Reference markup only; scripts and source actions removed.\nexport const referenceLayouts = '+json.dumps(records,ensure_ascii=False,separators=(',',':'))+' as const;\n')
(OUT/'sources.json').write_text(json.dumps({'references':{k:v['source'] for k,v in records.items()},'assets':CACHE,'failed':FAIL},indent=2))
print('assets',len(CACHE),'failed',FAIL,flush=True)
