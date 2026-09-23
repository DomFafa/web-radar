import { createHash } from 'node:crypto';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

/** Checks the actual public response as well as a browser decode; HTTP 200 alone is insufficient. */
export async function verifyTemplateCovers(baseUrl, manifest, browser) {
  const page = await browser.newPage();
  const results = [];
  try {
    for (const [templateId, cover] of Object.entries(manifest)) {
      const url = new URL(cover.url, baseUrl).href;
      const response = await fetch(url, { signal: AbortSignal.timeout(30_000) });
      const contentType = response.headers.get('content-type')?.split(';')[0].trim();
      const bytes = Buffer.from(await response.arrayBuffer());
      const sha256 = createHash('sha256').update(bytes).digest('hex');
      if (response.status !== 200 || contentType !== 'image/jpeg' || sha256 !== cover.sha256) {
        throw Error(`${templateId}: invalid cover response (${response.status}, ${contentType}, sha256 ${sha256})`);
      }
      const dimensions = await page.evaluate(async url => {
        const image = new Image();
        image.src = url;
        await image.decode();
        return { width: image.naturalWidth, height: image.naturalHeight };
      }, url);
      if (dimensions.width !== cover.width || dimensions.height !== cover.height) {
        throw Error(`${templateId}: cover decoded with unexpected dimensions`);
      }
      results.push({ templateId, url, status: response.status, contentType, sha256, ...dimensions });
    }
    return results;
  } finally {
    await page.close();
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  let baseUrl = process.argv[2];
  const manifest = JSON.parse(await readFile(new URL('../src/worker/template-guides/covers.json', import.meta.url), 'utf8'));
  if (!Object.keys(manifest).length) throw Error('Template cover manifest is empty');
  let server, browser;
  try {
    // CI checks committed assets without regenerating screenshots or changing their hashes.
    if (!baseUrl) {
      const allowed = new Set(Object.values(manifest).map(cover => cover.url));
      server = createServer(async (request, response) => {
        const pathname = new URL(request.url, 'http://localhost').pathname;
        if (!allowed.has(pathname)) { response.writeHead(404); return response.end(); }
        try {
          const bytes = await readFile(new URL(`../public${pathname}`, import.meta.url));
          response.writeHead(200, { 'Content-Type': 'image/jpeg' });
          response.end(bytes);
        } catch { response.writeHead(404); response.end('Not found'); }
      });
      await new Promise((resolve, reject) => {
        server.once('error', reject);
        server.listen(0, '127.0.0.1', resolve);
      });
      baseUrl = `http://127.0.0.1:${server.address().port}`;
    }
    browser = await chromium.launch(process.platform === 'darwin' ? { channel: 'chrome' } : {});
    const results = await verifyTemplateCovers(baseUrl, manifest, browser);
    console.log(JSON.stringify({ verified: results.length, results }, null, 2));
  } finally {
    await browser?.close();
    if (server) await new Promise(resolve => server.close(resolve));
  }
}
