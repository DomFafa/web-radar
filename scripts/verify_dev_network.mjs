import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { unstable_startWorker } from 'wrangler';
import { proxyEnvironment, createOutboundService } from './dev-network.mjs';

const system = '  HTTPSEnable : 1\n  HTTPSProxy : 127.0.0.1\n  HTTPSPort : 7890\n';
assert.equal(proxyEnvironment({}, 'darwin', () => system).HTTPS_PROXY, 'http://127.0.0.1:7890');
assert.equal(proxyEnvironment({ HTTPS_PROXY: 'http://custom:8888' }, 'darwin', () => system).HTTPS_PROXY, 'http://custom:8888');
assert.match(proxyEnvironment({ NO_PROXY: 'example.com' }, 'linux').NO_PROXY, /example.com,localhost,127.0.0.1/);
const directory = await mkdtemp(join(tmpdir(), 'web-radar-network-'));
const outbound = createOutboundService(); let worker;
try {
  // A real workerd subrequest through the same outbound adapter as npm run dev.
  // No credentials, images, or paid generation are sent by this connectivity check.
  await writeFile(join(directory, 'worker.mjs'), `import { generateCloneBundle } from ${JSON.stringify(resolve('src/worker/clone-service.ts'))};
    import { defaultDraft } from ${JSON.stringify(resolve('src/worker/domain.ts'))};
    export default { async fetch(request) {
    if (new URL(request.url).pathname === '/clone') {
      const draft = defaultDraft(); draft.languages = ['en'];
      draft.products = [{id:'one',name:'Product',description:'',material:'',dimensions:''}];
      const result = await generateCloneBundle({TEXT_API_KEY:'test-only',TEXT_API_BASE_URL:'https://vision.invalid/v1'},
        {id:'runtime',name:'Runtime test',draft},
        {model:'runtime-test',uiImages:[{id:'one',assetId:'one',role:'home',name:'index.jpg'}]},
        async () => 'data:image/jpeg;base64,YWJj');
      return Response.json({files:Object.keys(result.generatedFiles)});
    }
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST', headers: {'Content-Type':'application/json'}, body: '{}',
      redirect: 'manual', signal: AbortSignal.timeout(20000)
    });
    return Response.json({upstreamStatus:response.status});
  }};`);
  await writeFile(join(directory, 'wrangler.json'), JSON.stringify({name:'network-check', main:'worker.mjs', compatibility_date:'2026-09-11',compatibility_flags:['nodejs_compat']}));
  worker = await unstable_startWorker({ config: join(directory, 'wrangler.json'), name: 'network-check', entrypoint: join(directory, 'worker.mjs'),
    compatibilityDate: '2026-09-11', dev: { server: { hostname: '127.0.0.1', port: 0 },
      persist: false, inspector: false, watch: false, logLevel: 'error', outboundService: async request => {
        if (new URL(request.url).hostname !== 'vision.invalid') return outbound.fetch(request);
        assert.equal(request.url, 'https://vision.invalid/v1/chat/completions');
        const input = await request.json(); assert.equal(input.model, 'runtime-test');
        const body = '<header>Runtime regression fixture</header><main><h1>Reference design</h1><p>This isolated test verifies that the actual generator can complete its outbound request and build every required page in the Cloudflare runtime.</p></main>';
        return Response.json({choices:[{finish_reason:'stop',message:{content:JSON.stringify({css:'body{margin:0}',
          pages:{en:Object.fromEntries(['home','catalog','about','contact','detail'].map(key=>[key,body]))}})}}]});
      } } });
  await worker.ready;
  const generated = await (await worker.fetch('http://localhost/clone')).json();
  assert.ok(generated.files.includes('en/index.html'));
  assert.equal(generated.files.length, 5);
  console.log('PASS: actual clone generator completes in workerd with an isolated mock provider.');
  const result = await (await worker.fetch('http://localhost/')).json();
  assert.equal(result.upstreamStatus, 401, JSON.stringify(result));
  console.log('PASS: workerd → system/environment HTTP proxy → official OpenAI chat/completions (HTTP 401 without credentials).');
} finally { await worker?.dispose(); await outbound.close(); await rm(directory, { recursive: true, force: true }); }
