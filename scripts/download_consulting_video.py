from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import subprocess,math
url='https://html.inversweb.com/corpox/assets/images/video/01.mp4'
size=5697828;count=12;chunk=math.ceil(size/count)
cache=Path('artifacts/template-reference-cache/video-parts');cache.mkdir(parents=True,exist_ok=True)
def get(i):
 start=i*chunk;end=min(size-1,start+chunk-1);p=cache/str(i)
 if p.exists() and p.stat().st_size==end-start+1:return p
 r=subprocess.run(['curl','-fLsS','--max-time','60','--range',f'{start}-{end}',url,'-o',str(p)],capture_output=True,text=True)
 if r.returncode or not p.exists() or p.stat().st_size!=end-start+1:raise RuntimeError(f'Incomplete video range {i}: {r.stderr}')
 return p
with ThreadPoolExecutor(max_workers=count) as pool:parts=list(pool.map(get,range(count)))
dest=Path('public/templates/references/ce8d3f4aa900dac0b430.mp4');dest.write_bytes(b''.join(p.read_bytes() for p in parts));assert dest.stat().st_size==size
print('Saved complete reference video:',dest,size)
