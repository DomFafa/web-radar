// A direct reconstruction of the supplied Senseng reference, explicitly recorded
// as reference-rebuild. This is not a simulated AI generation result.
import { readFile, writeFile } from 'node:fs/promises';
import { createServer } from 'vite';
const detail = JSON.parse(await readFile('artifacts/clone-fidelity/before.json', 'utf8'));
const project = detail.project;
const draft = structuredClone(project.draft);
const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom' });
try {
  const { renderSite } = await server.ssrLoadModule('/src/templates/index.ts');
  const { siteFilePath, validateSiteFiles } = await server.ssrLoadModule('/src/worker/static-site.ts');
  const { normalizeCloneImages } = await server.ssrLoadModule('/src/shared/clone.ts');
  const { themeStyles } = await server.ssrLoadModule('/src/templates/themes/styles.ts');
  const overrides = await readFile('scripts/styles/senseng-clone-reference.css', 'utf8');
  draft.cloneConfig.uiImages = normalizeCloneImages(draft.cloneConfig.uiImages);
  // Retain actual user product records; arrange the photographs in the reference order.
  const displayDraft = { ...draft, template: 'senseng-clean', products: [6,7,4,2,0,3,5,1].map(i => draft.products[i]) };
  const files = {};
  const baseStyle = '*{box-sizing:border-box}html{height:100%}body{margin:0;font-size:16px;line-height:1.6}a{color:inherit;text-decoration:none}img,video{max-width:100%;display:block}button,input,textarea,select{font:inherit}button,a{touch-action:manipulation}h2,h3{margin:0}button{cursor:pointer}.honeypot{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}';
  const onlySenseng = themeStyles.slice(0, themeStyles.indexOf('/* 02. SENSENG VIDEO')) + themeStyles.slice(themeStyles.lastIndexOf('@media (max-width: 1100px)'));
  for (const lang of draft.languages) for (const page of ['home','catalog','about','contact','detail']) {
    for (const product of page === 'detail' ? displayDraft.products : [undefined]) {
      let html = renderSite(displayDraft, { projectId: project.id, lang, page, productId: product?.id, assetUrl: id => `/__WR_ASSET_${id}__`, inquiryUrl: '/__WR_INQUIRY__', preview: false });
      html = html.replace(/<style>[\s\S]*?<\/style>/, `<style>${baseStyle}${onlySenseng}${overrides}</style>`)
        .replaceAll('/__WR_', '__WR_')
        .replace(/(<body\b)/, `$1 data-reference-page="${page}"`)
        .replace(/<section class="senseng-newsletter"[\s\S]*?<\/section>\s*<script>[\s\S]*?<\/script>/, '')
        .replaceAll('catalog/index.html', 'products/index.html');
      files[siteFilePath(lang, page, product?.id)] = html;
    }
  }
  validateSiteFiles(files, draft);
  draft.cloneConfig = { ...draft.cloneConfig, status: 'ready', error: undefined, generatedHtml: files['en/index.html'], generatedFiles: files, generatedAt: new Date().toISOString(), generation: { mode: 'reference-rebuild', imageCount: draft.cloneConfig.uiImages.length, pageCount: Object.keys(files).length, visuallyVerified: false } };
  await writeFile('artifacts/clone-fidelity/repaired-draft.json', JSON.stringify(draft));
  console.log(JSON.stringify({ pages: Object.keys(files), bytes: JSON.stringify(draft).length }));
} finally { await server.close(); }
