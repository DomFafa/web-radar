// Explicit live text-generation smoke test. It never creates or sends outreach tasks.
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createServer } from 'vite';
import { createOutboundService } from './dev-network.mjs';

const output='/tmp/web-radar-assistant-acceptance';
mkdirSync(output,{recursive:true});
const server=await createServer({configFile:false,cacheDir:output+'/live-vite-cache',server:{middlewareMode:true}});
const outbound=createOutboundService(),originalFetch=globalThis.fetch;
const env={};
for(const line of readFileSync('.dev.vars','utf8').split('\n')) {
  const match=line.match(/^(TEXT_[A-Z_]+)\s*=\s*(.*)$/);
  if(match)env[match[1]]=match[2].trim().replace(/^['"]|['"]$/g,'');
}
try {
  const {generateAssistantDraft}=await server.ssrLoadModule('/src/outreach/server/lib/assistant-ai.ts');
  const {emptyDraft}=await server.ssrLoadModule('/src/outreach/server/lib/assistant.ts');
  globalThis.fetch=(url,init)=>outbound.fetch(new Request(url,init));
  let draft=emptyDraft(['email','site']);
  const history=[],records=[];
  for(const input of [
    '我们生产不锈钢保温杯。这次面向英国零售采购商，希望介绍产品并邀请对方回复索取目录。请同时准备英文 EDM 和英文网站留言，不要编造价格或认证。',
    '请再短一点，语气像销售人员亲自写的，不要写成广告。',
  ]) {
    const start=Date.now();
    const result=await generateAssistantDraft(env,'isolated-live-smoke',draft,history,input,{groups:[],tags:[]});
    draft=result.draft;
    assert.deepEqual(draft.channels,['email','site']);
    assert.ok(draft.email.subject&&draft.email.bodyHtml.length>30&&draft.site.message.length>30);
    assert.equal(draft.sender.email,'');assert.equal(draft.sender.name,'');assert.equal(draft.sender.company,'');
    assert.deepEqual(draft.email.contactIds,[]);assert.deepEqual(draft.site.targets,[]);
    assert.doesNotMatch(draft.email.bodyHtml,/<(?:script|iframe|form|img)\b/i);
    records.push({elapsedMs:Date.now()-start,input,...result});
    history.push({role:'user',content:input},{role:'assistant',content:result.content});
    writeFileSync(output+'/live-model.json',JSON.stringify(records,null,2));
    console.log(JSON.stringify({step:records.length,elapsedMs:records.at(-1).elapsedMs,emailCharacters:draft.email.bodyHtml.length,siteCharacters:draft.site.message.length}));
  }
  console.log('PASS: two live-model drafting turns; both channels generated and revised, no invented sender or recipients, no send task created.');
}finally{globalThis.fetch=originalFetch;await server.close();await outbound.close();}
