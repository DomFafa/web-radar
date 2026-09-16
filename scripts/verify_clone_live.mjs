// Run only with explicit user authorization: this sends the 13 uploaded images
// and the existing local OpenAI credential to the official OpenAI API.
import { readFile, writeFile } from 'node:fs/promises';
import { parseEnv } from 'node:util';
import { createServer } from 'vite';
const project=JSON.parse(await readFile('artifacts/clone-fidelity/before.json','utf8')).project;
const local= parseEnv(await readFile('.dev.vars.test','utf8'));
const key=local.OPENAI_API_KEY;
if(!key)throw Error('Local OpenAI credential is not configured');
// Preserve the paid model response for diagnosis even if output validation fails.
const originalFetch=globalThis.fetch;
globalThis.fetch=async (...args)=>{
 const response=await originalFetch(...args);
 if(String(args[0]).startsWith('https://api.openai.com/v1/chat/completions')) {
  const raw=await response.clone().text();
  await writeFile('artifacts/clone-fidelity/live-provider-response.json',raw);
 }
 return response;
};
const server=await createServer({server:{middlewareMode:true,hmr:false},appType:'custom'});
try{
 const {generateCloneBundle}=await server.ssrLoadModule('/src/worker/clone-service.ts');
 const {normalizeCloneImages}=await server.ssrLoadModule('/src/shared/clone.ts');
 const config={...project.draft.cloneConfig,uiImages:normalizeCloneImages(project.draft.cloneConfig.uiImages)};
 const inputs=new Map(config.uiImages.map(image=>[image.assetId,image]));
 const startedAt=new Date().toISOString();
 console.log(JSON.stringify({event:'started',endpoint:'https://api.openai.com/v1/chat/completions',model:config.model,images:inputs.size}));
 const result=await generateCloneBundle({OPENAI_API_KEY:key,TEXT_API_BASE_URL:'https://api.openai.com/v1'},project,config,async id=>{
  const source=inputs.get(id);if(!source)return null;
  return 'data:image/jpeg;base64,'+(await readFile('artifacts/clone-fidelity/references/'+source.name)).toString('base64');
 });
 await writeFile('artifacts/clone-fidelity/live-result.json',JSON.stringify(result));
 await writeFile('artifacts/clone-fidelity/live-verification.json',JSON.stringify({startedAt,endedAt:new Date().toISOString(),generation:result.generation,files:Object.keys(result.generatedFiles)},null,2));
 console.log(JSON.stringify({event:'completed',generation:result.generation}));
}catch(error){
 const result={endedAt:new Date().toISOString(),code:error.code||'error',message:error.message};
 await writeFile('artifacts/clone-fidelity/live-verification.json',JSON.stringify(result,null,2));
 console.log(JSON.stringify(result));process.exitCode=1;
}finally{await server.close()}
