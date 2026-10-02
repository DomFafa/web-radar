import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { chromium } from '@playwright/test';
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';
import { pathToFileURL } from 'node:url';

// Local synthetic customer drafts only. Brand colors must affect rendered controls,
// preserve the original product media, and survive the private-preview transform.
// Env filters make it possible to reproduce one failure without weakening assertions.
const output = resolve('artifacts/template-brand-colors');
await mkdir(output, { recursive: true });
await build({ stdin: { contents: `export {renderSite} from './src/templates';
export {typedMaterialsFixture} from './tests/fixtures/materials-typed';
export {draftFromMaterials} from './src/worker/materials-service';
export {projectPreviewHtml} from './src/worker/project-preview';
export {brandColorPatch} from './src/shared/template-brand-color';`, resolveDir: process.cwd() },
bundle: true, keepNames: true, platform: 'node', format: 'esm', outfile: resolve(output, 'render.mjs') });
const render = await import(pathToFileURL(resolve(output, 'render.mjs')).href);

// Independent acceptance selectors: do not import the CSS implementation map.
const targets = {
  auravell: { button: '.rt-button-v1:not([class*="w-variant"]), .auravell-inquiry-box button[type="submit"]', nav: 'header nav a, .w-nav-menu a', card: '.rt-contact-form-v1, .auravell-inquiry-box' },
  'careflow-healthcare': { button: '.primary-button', nav: '.list-nav-menu .link', card: '.card.contact-card-v4, .cf-form-card' },
  'toorun-early-learning': { button: '.tr-button:not(.tr-button-secondary), .tr-form-wrap button[type="submit"]', nav: '.tr-desktop-nav a', card: '.tr-contact aside', solidCard: true },
  'lumi-business': { button: '.lumi-cta:not([data-framer-name^="White"]), .lumi-button, a[data-framer-name^="Dark"]:not([data-framer-name="Dark"]), a[data-framer-name^="Blue"], form button[type="submit"]', nav: '[data-framer-name="Nav Links"] a', card: '[data-framer-name="Form Wrapper"]' },
  'pawfect-groom': { button: '.pg-button:not(.pg-secondary), .form-grid button[type="submit"]', nav: '.pg-header nav a', card: '.pg-form' },
  'mello-coffee': { button: '.button:not([class*="w-variant"]), .form-grid button[type="submit"]', nav: '.menu-link', card: '.mello-form-card' },
  'senseng-candy': { button: '.button[style*="background:#ff6b8b"], .button[style*="background:linear-gradient(135deg, #ff6b8b"], .wr-confirmed-hero .button, form button[type="submit"]', nav: 'header nav a', card: 'main[data-wr-page="contact"] .wr-card-hover' },
  'senseng-video': { button: '.senseng-btn-pill, .senseng-btn-detail, .senseng-form button[type="submit"]', nav: '.senseng-header nav a', card: '.wr-card-hover:has(> form.senseng-form)' },
  'senseng-nature': { button: '.button[style*="background:#2d4a22"], .button[style*="background:#1e3318"], .wr-confirmed-hero .button, form button[type="submit"]', nav: 'header nav a', card: 'main[data-wr-page="contact"] .wr-nature-card' },
};
const ids = process.env.BRAND_TEMPLATE_IDS?.split(',') || Object.keys(targets);
const widths = process.env.BRAND_VIEWPORTS?.split(',').map(Number) || [1440, 390];
const modes = process.env.BRAND_MODES?.split(',') || ['native', 'materials'];
const pages = process.env.BRAND_PAGES?.split(',') || ['home', 'contact'];
const presentations = process.env.BRAND_PRESENTATIONS?.split(',') || ['public', 'preview'];
const colors = process.env.BRAND_COLORS?.split(',') || ['#b42318', '#facc15'];
assert(ids.every(id => targets[id]), 'Unknown template filter');
assert(colors.every(color => /^#[\da-f]{6}$/i.test(color)), 'Colors must be six-digit hex');
const publicDir = resolve('public');
const fixtureImage = await readFile(resolve(publicDir, 'templates/senseng/products-1.jpg'));
const responses = new Map();
const server = createServer(async (request, response) => {
  const url = new URL(request.url, 'http://local.invalid');
  const html = responses.get(url.pathname);
  if (html !== undefined) { response.setHeader('Content-Type', 'text/html'); return response.end(html); }
  if (url.pathname.startsWith('/media/')) {
    response.writeHead(200, { 'Content-Type': 'image/jpeg', 'Access-Control-Allow-Origin': '*' });
    return response.end(fixtureImage);
  }
  if (url.pathname === '/favicon.ico') { response.writeHead(204); return response.end(); }
  const file = resolve(publicDir, '.' + decodeURIComponent(url.pathname));
  if (url.pathname.startsWith('/templates/') && file.startsWith(publicDir + sep)) {
    try {
      const bytes = await readFile(file);
      response.writeHead(200, { 'Content-Type': { '.css':'text/css', '.js':'text/javascript', '.svg':'image/svg+xml', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.png':'image/png', '.webp':'image/webp', '.avif':'image/avif', '.woff':'font/woff', '.woff2':'font/woff2', '.ttf':'font/ttf', '.otf':'font/otf', '.mp4':'video/mp4' }[extname(file)] || 'application/octet-stream', 'Access-Control-Allow-Origin':'*', 'Cross-Origin-Resource-Policy':'cross-origin' });
      return response.end(bytes);
    } catch { /* Real missing files must not fall back to HTML. */ }
  }
  response.writeHead(404); response.end('Not found');
});
await new Promise(done => server.listen(0, '127.0.0.1', done));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch(process.platform === 'darwin' ? { channel: 'chrome' } : {});
const results = [], failures = [], mediaBaselines = new Map(), decorationBaselines = new Map();
try {
  for (const id of ids) {
    const submission = await render.typedMaterialsFixture(id, 3);
    const customer = render.draftFromMaterials(submission, Object.fromEntries(submission.materials.media.map(asset => [asset.id, { id: asset.id }])));
    customer.company.phone = '+1 202 555 0140';
    customer.company.address = 'Example Street, Sample City';
    for (const mode of modes) for (const pageName of pages) for (const presentation of presentations) {
      const source = structuredClone(customer);
      if (mode === 'native') delete source.materials;
      for (const width of widths) for (const color of colors) {
        const label = `${id}/${mode}/${pageName}/${presentation}/${width}/${color}`;
        console.log(`Checking ${label}`);
        const context = await browser.newContext({ viewport: { width, height: 960 }, reducedMotion: 'reduce' });
        const page = await context.newPage();
        const errors = [], missing = [];
        page.on('pageerror', error => errors.push(error.message));
        page.on('response', response => { if (response.status() >= 400) missing.push(response.url()); });
        await context.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
        try {
          const draft = { ...source, ...render.brandColorPatch(source, color) };
          let html = render.renderSite(draft, { projectId: 'brand-color-regression', lang: 'en', page: pageName, productId: customer.products[0]?.id, assetUrl: id => id.startsWith('/templates/') ? origin + id : origin + '/media/' + id, inquiryUrl: origin + '/inquiry', preview: presentation === 'preview' });
          if (presentation === 'preview') html = render.projectPreviewHtml(html, '/preview-api', origin, { page: pageName, lang: 'en', productId: customer.products[0]?.id, expectedVersion: 1 });
          html = html.replace('<head>', `<head><base href="${origin}/">`);
          let frame = page.mainFrame();
          if (presentation === 'preview') {
            responses.set('/case', '<!doctype html><html><body style="margin:0"><iframe id="preview" sandbox="allow-scripts" style="display:block;width:100%;height:960px;border:0"></iframe></body></html>');
            await page.goto(origin + '/case');
            await page.locator('#preview').evaluate((iframe, content) => { iframe.srcdoc = content; }, html);
            frame = page.frames().find(candidate => candidate !== page.mainFrame());
          } else {
            responses.set('/case', html);
            await page.goto(origin + '/case', { waitUntil: 'domcontentloaded' });
          }
          await frame.waitForSelector('body[data-template]', { state: 'attached' });
          await frame.evaluate(async () => {
            await document.fonts.ready;
            await Promise.all([...document.images].filter(image => image.loading !== 'lazy').map(image => image.decode().catch(() => {})));
            await new Promise(done => requestAnimationFrame(() => requestAnimationFrame(done)));
          });
          const firstVisible = async selector => {
            const candidates = frame.locator(selector);
            for (let index = 0; index < await candidates.count(); index++) if (await candidates.nth(index).isVisible()) return candidates.nth(index);
          };
          const control = await firstVisible(targets[id].button);
          assert(control, `${label}: a visible primary action is required`);
          await control.scrollIntoViewIfNeeded();
          const measureControl = (element, { color }) => {
            const normalize = input => {
              const canvas = document.createElement('canvas'), ctx = canvas.getContext('2d');
              canvas.width = canvas.height = 1; ctx.fillStyle = input; ctx.fillRect(0, 0, 1, 1);
              return [...ctx.getImageData(0, 0, 1, 1).data];
            };
            const expected = normalize(color);
            const isBrand = value => normalize(value).every((channel, index) => channel === expected[index]);
            const background = [element, ...element.querySelectorAll('*')].find(node => isBrand(getComputedStyle(node).backgroundColor));
            const texts = [element, ...element.querySelectorAll('*')].filter(node => [...node.childNodes].some(child => child.nodeType === Node.TEXT_NODE && child.textContent.trim()) && node.getBoundingClientRect().width > 0);
            const luminance = channels => channels.slice(0, 3).map(channel => channel / 255).map(channel => channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4).reduce((total, channel, index) => total + channel * [.2126, .7152, .0722][index], 0);
            const contrast = node => {
              // Icons can have their own light circular surface inside a dark CTA.
              // Measure that actual background instead of treating every child as
              // if it were painted directly on the selected primary color.
              let background = expected, current = node;
              while (current && current !== element.parentElement) {
                const candidate = normalize(getComputedStyle(current).backgroundColor);
                if (candidate[3] === 255) { background = candidate; break; }
                current = current.parentElement;
              }
              const values = [luminance(normalize(getComputedStyle(node).color)), luminance(background)].sort((a,b) => b-a);
              return (values[0]+.05)/(values[1]+.05);
            };
            return {
              viewport: innerWidth, scrollWidth: document.documentElement.scrollWidth,
              overflowElements: document.documentElement.scrollWidth > innerWidth + 2 ? [...document.querySelectorAll('body *')].map(node => ({ tag: node.tagName, class: node.className?.baseVal ?? node.className, right: Math.round(node.getBoundingClientRect().right + scrollX), width: Math.round(node.getBoundingClientRect().width), parent: node.parentElement?.tagName + '.' + node.parentElement?.className, parentDisplay: node.parentElement ? getComputedStyle(node.parentElement).display : '', parentWrap: node.parentElement ? getComputedStyle(node.parentElement).flexWrap : '' })).filter(node => node.width > 0 && node.right > innerWidth + 2).sort((a,b) => b.right-a.right).slice(0,10) : [],
              branded: document.body.dataset.wrBrandColor, primaryBackground: background ? getComputedStyle(background).backgroundColor : null,
              primaryText: texts.map(node => ({ text: node.textContent.trim().slice(0,100), color: getComputedStyle(node).color, contrast: contrast(node) })),
              images: [...document.images].filter(image => image.src.includes('/media/')).map(image => ({ src: image.getAttribute('src'), srcset: image.getAttribute('srcset'), filter: getComputedStyle(image).filter, fit: getComputedStyle(image).objectFit })),
              bodyBackground: getComputedStyle(document.body).backgroundColor,
            };
          };
          const metrics = await control.evaluate(measureControl, { color });
          assert.equal(metrics.branded, color.toLowerCase(), `${label}: final theme boundary missing`);
          assert(metrics.primaryBackground, `${label}: actual primary action does not use ${color}`);
          assert(metrics.primaryText.length, `${label}: primary action text is missing`);
          assert(metrics.primaryText.every(text => text.contrast >= 4.5), `${label}: primary action text contrast below 4.5: ${JSON.stringify(metrics.primaryText)}`);
          assert(metrics.scrollWidth <= width + 2, `${label}: horizontal overflow ${metrics.scrollWidth}px: ${JSON.stringify(metrics.overflowElements)}`);
          // Several templates collapse the navigation at mobile widths.
          if (width >= 1024) {
            await frame.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
            const navigation = await firstVisible(targets[id].nav);
            assert(navigation, `${label}: desktop navigation target is missing`);
            await navigation.hover();
            await navigation.evaluate(async node => {
              const transitions = node.getAnimations({ subtree: true }).filter(animation => animation.effect?.getTiming().iterations !== Infinity);
              await Promise.all(transitions.map(animation => animation.finished.catch(() => {})));
            });
            metrics.navigation = await navigation.evaluate(node => ({ color: getComputedStyle(node).color, border: getComputedStyle(node).borderBottomColor }));
          }
          if (pageName === 'contact') {
            const submit = await firstVisible('form button[type="submit"]');
            assert(submit, `${label}: contact form submit action is missing`);
            const submitMetrics = await submit.evaluate(measureControl, { color });
            metrics.submit = { background: submitMetrics.primaryBackground, text: submitMetrics.primaryText };
            assert(metrics.submit.background, `${label}: actual contact submit does not use ${color}`);
            assert(metrics.submit.text.length && metrics.submit.text.every(text => text.contrast >= 4.5), `${label}: contact submit text is unreadable: ${JSON.stringify(metrics.submit.text)}`);
            const card = await firstVisible(targets[id].card);
            assert(card, `${label}: contact card target is missing`);
            metrics.contactCard = await card.evaluate((node, solid) => {
              const style = getComputedStyle(node), probe = document.createElement('span');
              probe.style.backgroundColor = getComputedStyle(document.body).getPropertyValue(solid ? '--wr-brand' : '--wr-brand-soft');
              document.body.append(probe); const expectedBackground = getComputedStyle(probe).backgroundColor; probe.remove();
              return { background: style.backgroundColor, border: style.borderTopColor, expectedBackground };
            }, !!targets[id].solidCard);
            assert.notEqual(metrics.contactCard.background, 'rgba(0, 0, 0, 0)', `${label}: contact card requires a visible brand surface`);
            assert.equal(metrics.contactCard.background, metrics.contactCard.expectedBackground, `${label}: contact card does not use the selected brand surface`);
            const field = await firstVisible('form input[name="name"], form input[type="email"]');
            assert(field, `${label}: contact field for keyboard focus is missing`);
            await field.focus();
            await field.evaluate(async node => {
              const transitions = node.getAnimations().filter(animation => animation.effect?.getTiming().iterations !== Infinity);
              await Promise.all(transitions.map(animation => animation.finished.catch(() => {})));
            });
            metrics.focus = await field.evaluate((node, color) => {
              const style = getComputedStyle(node), probe = document.createElement('span');
              probe.style.color = color; document.body.append(probe);
              const expected = getComputedStyle(probe).color; probe.remove();
              return { focused: document.activeElement === node, expected, border: style.borderTopColor, borderWidth: parseFloat(style.borderTopWidth), outline: style.outlineColor, outlineWidth: parseFloat(style.outlineWidth), outlineStyle: style.outlineStyle };
            }, color);
            assert(metrics.focus.focused, `${label}: keyboard focus did not reach the contact field`);
            assert((metrics.focus.borderWidth > 0 && metrics.focus.border === metrics.focus.expected) || (metrics.focus.outlineWidth > 0 && metrics.focus.outlineStyle !== 'none' && metrics.focus.outline === metrics.focus.expected), `${label}: focus border/outline does not use the brand color: ${JSON.stringify(metrics.focus)}`);
          }
          const comparison = `${id}/${mode}/${pageName}/${presentation}/${width}`;
          if (mediaBaselines.has(comparison)) assert.deepEqual(metrics.images, mediaBaselines.get(comparison), `${label}: brand choice altered image identity or visual treatment`);
          else mediaBaselines.set(comparison, metrics.images);
          const previousDecoration = decorationBaselines.get(comparison);
          if (previousDecoration && previousDecoration.color !== color) {
            if (metrics.navigation) assert.notDeepEqual(metrics.navigation, previousDecoration.navigation, `${label}: navigation color did not respond to brand selection`);
            if (metrics.contactCard) assert.notDeepEqual(metrics.contactCard, previousDecoration.contactCard, `${label}: contact card color did not respond to brand selection`);
          } else decorationBaselines.set(comparison, { color, navigation: metrics.navigation, contactCard: metrics.contactCard });
          assert.deepEqual(errors, [], `${label}: browser runtime errors`);
          assert.deepEqual(missing, [], `${label}: missing local assets`);
          const representative = mode === 'native' && presentation === 'public' &&
            ((pageName === 'home' && ['senseng-candy','senseng-nature','mello-coffee'].includes(id)) || (pageName === 'contact' && id === 'careflow-healthcare'));
          if (process.env.BRAND_SCREENSHOTS === '1' || representative) {
            await frame.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
            await page.screenshot({ path: resolve(output, label.replaceAll('/', '-').replace('#','') + '.png') });
          }
          results.push({ label, ...metrics });
        } catch (error) {
          failures.push({ label, message: error.message, errors, missing });
          await page.screenshot({ path: resolve(output, 'FAIL-' + label.replaceAll('/', '-').replace('#','') + '.png') }).catch(() => {});
          console.error(`FAIL ${label}: ${error.message}`);
        } finally { await context.close(); }
      }
    }
  }
} finally {
  await browser.close(); server.closeAllConnections(); await new Promise(done => server.close(done));
  await writeFile(resolve(output, 'results.json'), JSON.stringify({ passed: results.length, failed: failures.length, results, failures }, null, 2) + '\n');
}
assert.equal(failures.length, 0, `${failures.length} brand-color browser checks failed. See ${output}/results.json`);
console.log(`PASS: ${results.length} template brand-color browser cases.`);
