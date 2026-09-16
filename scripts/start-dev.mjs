import { parseArgs } from 'node:util';
import { unstable_startWorker } from 'wrangler';
import { proxyEnvironment, createOutboundService } from './dev-network.mjs';

const { values } = parseArgs({ options: {
  env: { type: 'string' }, port: { type: 'string', default: '8788' },
  'persist-to': { type: 'string', default: '.wrangler/state' },
} });
const port = Number(values.port);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw Error('Invalid local port');
const env = proxyEnvironment();
const outbound = createOutboundService(env);
let worker;
try {
  worker = await unstable_startWorker({
    config: 'wrangler.jsonc', env: values.env,
    dev: {
      remote: false, server: { hostname: '127.0.0.1', port },
      persist: values['persist-to'], inspector: false,
      outboundService: outbound.fetch,
    },
  });
  await worker.ready;
  console.log(`[web-radar] ${await worker.url} — outbound network: ${env.https_proxy || env.HTTPS_PROXY || env.http_proxy || env.HTTP_PROXY ? 'HTTP proxy (environment/system)' : 'direct'}`);
} catch (error) {
  await worker?.dispose(); await outbound.close(); throw error;
}
let stopping = false;
async function stop() {
  if (stopping) return; stopping = true;
  await worker.dispose(); await outbound.close(); process.exit(0);
}
process.on('SIGINT', stop); process.on('SIGTERM', stop);
