"""Keep assets reachable from the generated reference layouts; archive import caches."""
from pathlib import Path
import re,json
root=Path(__file__).resolve().parents[1]
assets=root/'public/templates/references';cache=root/'artifacts/template-reference-cache';cache.mkdir(parents=True,exist_ok=True)
for p in assets.glob('*.css.raw'):p.replace(cache/p.name)
for p in assets.glob('*.download'):p.unlink()
pattern=re.compile(r'/templates/references/([A-Za-z0-9_.-]+)')
reachable=set(pattern.findall('\n'.join(p.read_text() for p in (root/'src/templates/themes').glob('reference*.ts'))))
scanned=set()
while pending:=reachable-scanned:
 for name in pending:
  scanned.add(name);p=assets/name
  if p.suffix=='.css' and p.exists():reachable.update(pattern.findall(p.read_text()))
removed=[]
for p in assets.iterdir():
 if p.is_file() and p.name not in reachable and p.name!='sources.json':removed.append(p.name);p.unlink()
print(json.dumps({'retained':len(reachable),'removed':len(removed),'bytes':sum(p.stat().st_size for p in assets.iterdir() if p.is_file())}))
