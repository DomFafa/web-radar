import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
const origin='http://127.0.0.1:8788';
const before=JSON.parse(await readFile('artifacts/clone-fidelity/before.json','utf8')).project;
const draft=JSON.parse(await readFile('artifacts/clone-fidelity/repaired-draft.json','utf8'));
const login=await fetch(origin+'/api/auth/test-login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({identity:'owner'})});
assert.equal(login.status,200);
const cookie=login.headers.get('set-cookie').split(';')[0];
async function api(path,method='GET',data){const res=await fetch(origin+path,{method,headers:{Cookie:cookie,'Content-Type':'application/json',Origin:origin},...(data?{body:JSON.stringify(data)}:{})});const result=await res.json();if(!res.ok)throw Error(JSON.stringify({status:res.status,error:result}));return result}
const base='/api/projects/'+before.id;
const current=(await api(base)).project;
assert.deepEqual(current.draft.products,before.draft.products,'Product data changed during repair');
assert.deepEqual(current.draft.company,before.draft.company,'Company data changed during repair');
await writeFile('artifacts/clone-fidelity/pre-apply.json',JSON.stringify(current,null,2));
const saved=(await api(base,'PUT',{expectedVersion:current.version,draft:{...current.draft,cloneConfig:draft.cloneConfig,buildBranch:'clone'}})).project;
const job=(await api(base+'/publish','POST',{expectedVersion:saved.version,requestId:crypto.randomUUID()})).job;
let detail;
for(let i=0;i<40;i++){
 detail=await api(base);const running=detail.jobs.find(j=>j.id===job.id);
 if(running.status==='failed')throw Error(running.error);
 if(running.status==='succeeded'){console.log(JSON.stringify({version:detail.project.version,release:detail.releases.find(r=>r.id===running.input.releaseId)} ,(key,value)=>key==='draft'?undefined:value));break}
 await new Promise(resolve=>setTimeout(resolve,500));
}
await writeFile('artifacts/clone-fidelity/after.json',JSON.stringify(detail,null,2));
