import { withBanner } from '../shared/banner';
import type { Draft, Language, Product } from '../shared/model';
import { withFavicon } from '../shared/favicon';
import { labels } from './labels';
import { styles } from './styles';
import { themeStyles } from './themes/styles';
import { buildThemeContext } from './themes/types';
import { renderSensengHome, renderSensengPage } from './themes/senseng';
import { isReferenceTemplate, renderReferencePage } from './themes/reference';
import { renderSaasHome } from './themes/saasAutomation';
import { renderFintechHome } from './themes/fintechPlatform';
import { renderMarketingHome } from './themes/digitalMarketing';
import { renderAccountingHome } from './themes/portoAccounting';
import { renderCraftoHome } from './themes/craftoCorporate';
import { renderToysHome } from './themes/junoToys';
import { renderAiAgencyHome } from './themes/corpoxAiAgency';
import { renderConsultingHome } from './themes/corpoxConsulting';
import { renderCandyHome, renderCandyPage } from './themes/sensengCandy';
import { renderWonderHome, renderWonderPage } from './themes/sensengWonder';
import { renderArcadeHome, renderArcadePage } from './themes/sensengArcade';
import { renderNatureHome, renderNaturePage } from './themes/sensengNature';
import { renderMinimalHome, renderMinimalPage } from './themes/sensengMinimal';
import { materialProductImage,materialsSensengBody,materialsSeo,materialsThemeStyle } from './materials-render';
import { materialsRuntime } from '../shared/materials-runtime';
export { labels };
export interface RenderOptions {
  projectId: string;
  lang: Language;
  page: string;
  productId?: string;
  assetUrl: (id: string) => string;
  inquiryUrl: string;
  preview?: boolean;
}
const esc = (value: unknown) =>
  String(value ?? '').replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  );
const json = (value: unknown) =>
  JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
function safeUrl(value: string, blob = false): string {
  try {
    if (value.startsWith('/') && !value.startsWith('//') && !value.includes('\\')) return value;
    const u = new URL(value);
    if (u.username || u.password) return '';
    if (
      u.protocol === 'https:' ||
      (u.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(u.hostname)) ||
      (blob && u.protocol === 'blob:')
    )
      return u.href;
  } catch {}
  return '';
}
function segment(id: string): string {
  if (id === '.' || id === '..' || !id) throw Error('Invalid product identifier');
  return encodeURIComponent(id).replace(/\./g, '%2E');
}
const productPath = (id: string) => `products/${segment(id)}/index.html`;
export function renderSite(draft: Draft, options: RenderOptions): string {
  const html=withBanner(withFavicon(renderSiteHtml(draft, options), draft, options.assetUrl), draft, options.assetUrl, {page: options.page, productId: options.productId ?? draft.primaryProductId});
  // Wrangler's keepNames inserts __name calls inside stringified functions.
  // Keep the approved branch self-contained when it runs outside the Worker.
  return draft.materials?html.replace('<script>', '<script>var __name=(value)=>value;').replace('</body>',`<script>(()=>{const __name=(value)=>value;(${materialsRuntime.toString()})();})();</script></body>`):html;
}
function renderSiteHtml(draft: Draft, options: RenderOptions): string {
  const lang = draft.languages.includes(options.lang) ? options.lang : 'en';
  const ui = labels[lang];
  const template = draft.template || 'senseng-clean';
  const page = ['home', 'catalog', 'detail', 'about', 'contact'].includes(options.page)
    ? options.page
    : 'home';
  const company = draft.company;
  const copy = draft.copy[lang] ?? {
    headline: company.slogan || company.name,
    subtitle: company.description || '',
    about: lang === 'en' ? company.description : '',
    cta: ui.discover,
  };
  const depth = page === 'home' ? '' : page === 'detail' ? '../../' : '../';
  const path = (p: string) => `${depth}${p}`;
  const navPath = (p: string) => (p === 'home' ? 'index.html' : `${p}/index.html`);
  const color = /^#[0-9a-f]{6}$/i.test(draft.brandColor) ? draft.brandColor : '#52684b';
  const asset = (id?: string) => (id ? safeUrl(options.assetUrl(id), options.preview) : '');
  const translate = (p: Product) => ({
    name: p.translations?.[lang]?.name ?? p.name,
    description: p.translations?.[lang]?.description ?? (lang === 'en' ? p.description : ''),
  });
  const mainProduct =
    draft.products.find((p) => p.id === draft.primaryProductId) ?? draft.products[0];
  const defaultProductImg =
    asset(mainProduct?.imageAssetId) ||
    asset(draft.products.find((p) => p.imageAssetId)?.imageAssetId);
  const img = (p: Product) => {
    const url = asset(p.imageAssetId) || defaultProductImg;
    const prepared=materialProductImage(draft,options,p);
    if(prepared)return `<div class="product-image">${prepared}</div>`;
    return `<div class="product-image">${url ? `<img src="${esc(url)}" alt="${esc(translate(p).name)}" loading="lazy" decoding="async">` : `<span class="empty-image">${esc(ui.unavailable)}</span>`}</div>`;
  };
  const gallery = (p: Product) => {
    const images = (p.gallery ?? []).filter(image=>image.assetId !== p.imageAssetId && asset(image.assetId));
    if(draft.materials)return images.length?`<div class="product-gallery" style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:12px">${images.map(image=>materialProductImage(draft,options,p,image.assetId)||'').join('')}</div>`:'';
    return images.length ? `<div class="product-gallery" style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:12px">${images.map(image=>`<img src="${esc(asset(image.assetId))}" alt="${esc(image.caption || translate(p).name)}" loading="lazy" style="width:100%;aspect-ratio:1;object-fit:contain">`).join('')}</div>` : '';
  };
  const websiteDetails = (p: Product) => lang === 'en' ? `${p.tagline ? `<p>${esc(p.tagline)}</p>` : ''}${[p.sellingPoints,p.applications].map(values=>values?.length ? `<ul>${values.map(value=>`<li>${esc(value)}</li>`).join('')}</ul>` : '').join('')}` : '';
  const navAttrs = (p: string, id?: string) =>
    `data-wr-page="${p}"${id ? ` data-wr-product-id="${esc(id)}"` : ''}`;
  const navLink = (p: string, label: string) =>
    `<a href="${path(navPath(p))}" ${navAttrs(p)}${p === page ? ' aria-current="page"' : ''}>${esc(label)}</a>`;
  const cards = (products: Product[]) =>
    products.length
      ? `<div class="grid">${products.map((p, i) => `<article class="product-card"><p class="product-number">${String(i + 1).padStart(2, '0')} / ${String(products.length).padStart(2, '0')}</p><a href="${path(productPath(p.id))}" ${navAttrs('detail', p.id)}>${img(p)}<h3>${esc(translate(p).name)}</h3></a>${translate(p).description ? `<p>${esc(translate(p).description)}</p>` : ''}<a class="text-link" href="${path(productPath(p.id))}" ${navAttrs('detail', p.id)}>${esc(ui.details)} <span aria-hidden="true">↗</span></a></article>`).join('')}</div>`
      : `<p class="muted">${esc(ui.noProducts)}</p>`;
  const channels = [1, 3, 5]
    .map((i) => parseInt(color.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  const brandInk =
    channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722 > 0.179
      ? '#17261c'
      : '#ffffff';
  const poster = asset(draft.posterAssetId) || asset(mainProduct?.imageAssetId);
  const video = asset(draft.heroAssetId);
  const hero = `<section class="hero" aria-label="${esc(copy.headline)}">${poster ? `<img class="poster" src="${esc(poster)}" alt="">` : ''}${video ? `<video id="hero-video" autoplay muted loop playsinline preload="metadata"${poster ? ` poster="${esc(poster)}"` : ''} aria-hidden="true"><source src="${esc(video)}"></video>` : ''}<div class="wrap hero-content"><span class="eyebrow">${esc(company.name)}</span><${page === 'home' ? 'h1' : 'h2'} class="hero-title">${esc(copy.headline)}</${page === 'home' ? 'h1' : 'h2'}>${copy.subtitle ? `<p>${esc(copy.subtitle)}</p>` : ''}<a class="button" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>${esc(copy.cta || ui.discover)} <span aria-hidden="true">↗</span></a></div>${video ? `<div class="hero-controls"><button type="button" id="video-toggle" class="video-control" aria-label="${esc(ui.pause)}">Ⅱ</button></div>` : ''}</section>`;
  const contactBand = `<section class="contact-band"><div class="wrap"><div><span class="eyebrow">${esc(ui.contact)}</span><h2>${esc(ui.conversation)}</h2></div><a class="button" href="${path('contact/index.html')}" ${navAttrs('contact')}>${esc(ui.contact)} <span aria-hidden="true">↗</span></a></div></section>`;
  const aboutText = copy.about || '';
  const story = `<section class="story wrap">${mainProduct ? `<div class="story-visual">${asset(mainProduct.imageAssetId) ? `<img src="${esc(asset(mainProduct.imageAssetId))}" alt="${esc(translate(mainProduct).name)}" loading="lazy">` : ''}</div>` : ''}<div><span class="eyebrow">${esc(ui.about)}</span><h2>${esc(company.name)}</h2>${aboutText ? `<p>${esc(aboutText)}</p>` : ''}<a class="text-link" href="${path('about/index.html')}" ${navAttrs('about')}>${esc(ui.about)} ↗</a></div></section>`;
  let content = '';
  if (page === 'home') {
    const ctx = buildThemeContext(draft, options);
    switch (template) {
      case 'senseng-clean':
        content = renderSensengHome(ctx, false);
        break;
      case 'senseng-video':
        content = renderSensengHome(ctx, true);
        break;
      case 'saas-automation':
        content = renderSaasHome(ctx);
        break;
      case 'fintech-platform':
        content = renderFintechHome(ctx);
        break;
      case 'digital-marketing':
        content = renderMarketingHome(ctx);
        break;
      case 'porto-accounting':
        content = renderAccountingHome(ctx);
        break;
      case 'crafto-corporate':
        content = renderCraftoHome(ctx);
        break;
      case 'juno-toys':
        content = renderToysHome(ctx);
        break;
      case 'corpox-ai-agency':
        content = renderAiAgencyHome(ctx);
        break;
      case 'corpox-consulting':
        content = renderConsultingHome(ctx);
        break;
      case 'senseng-candy':
        content = renderCandyHome(ctx);
        break;
      case 'senseng-wonder':
        content = renderWonderHome(ctx);
        break;
      case 'senseng-arcade':
        content = renderArcadeHome(ctx);
        break;
      case 'senseng-nature':
        content = renderNatureHome(ctx);
        break;
      case 'senseng-minimal':
        content = renderMinimalHome(ctx);
        break;
      default:
        content = `${hero}<section class="chapter wrap"><div class="section-top"><div><span class="eyebrow">${esc(ui.products)}</span><h2>${esc(ui.catalog)}</h2></div><a class="text-link" href="catalog/index.html" ${navAttrs('catalog')}>${esc(ui.allProducts)} ↗</a></div>${cards(draft.products.slice(0, template === 'explorer' ? 4 : 3))}</section>${story}${contactBand}`;
        break;
    }
  }
  if (page === 'catalog')
    content = `<div class="wrap"><header class="page-heading"><span class="eyebrow">${esc(company.name)}</span><h1>${esc(ui.catalog)}</h1></header><section class="chapter" style="padding-top:0">${cards(draft.products)}</section></div>${contactBand}`;
  if (page === 'about')
    content = `<div class="wrap"><header class="page-heading"><span class="eyebrow">${esc(ui.about)}</span><h1>${esc(company.name)}</h1><p>${esc(company.type === 'factory' ? ui.factory : ui.trader)}</p></header>${aboutText ? `<div class="about-full">${esc(aboutText)}</div>` : ''}${company.establishedYear || company.certifications || company.capabilities ? `<div class="about-highlights grid" style="margin-top:24px;display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px">${company.establishedYear ? `<div style="background:rgba(0,0,0,0.02);padding:16px;border-radius:8px;border:1px solid #e5e7eb"><h4 style="margin:0 0 6px;font-size:13px;color:var(--brand)">ESTABLISHED</h4><p style="margin:0;font-weight:600">${esc(company.establishedYear)}</p></div>` : ''}${company.certifications ? `<div style="background:rgba(0,0,0,0.02);padding:16px;border-radius:8px;border:1px solid #e5e7eb"><h4 style="margin:0 0 6px;font-size:13px;color:var(--brand)">CERTIFICATIONS</h4><p style="margin:0;font-weight:600">${esc(company.certifications)}</p></div>` : ''}${company.capabilities ? `<div style="background:rgba(0,0,0,0.02);padding:16px;border-radius:8px;border:1px solid #e5e7eb"><h4 style="margin:0 0 6px;font-size:13px;color:var(--brand)">CAPABILITIES</h4><p style="margin:0;font-weight:600">${esc(company.capabilities)}</p></div>` : ''}</div>` : ''}</div>${hero}${contactBand}`;
  if (page === 'detail') {
    const p = draft.products.find((item) => item.id === options.productId);
    content = p
      ? `<section class="detail wrap"><div>${img(p)}${gallery(p)}</div><div><a class="text-link" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>← ${esc(ui.back)}</a><h1>${esc(translate(p).name)}</h1>${websiteDetails(p)}${translate(p).description ? `<p>${esc(translate(p).description)}</p>` : ''}<dl class="specs">${p.material ? `<div><dt>${esc(ui.material)}</dt><dd>${esc(p.material)}</dd></div>` : ''}${p.dimensions ? `<div><dt>${esc(ui.dimensions)}</dt><dd>${esc(p.dimensions)}</dd></div>` : ''}</dl><a class="button" href="${path('contact/index.html')}?productId=${esc(encodeURIComponent(p.id))}" ${navAttrs('contact', p.id)}>${esc(ui.inquire)} ↗</a></div></section><section class="chapter wrap"><div class="section-top"><h2>${esc(ui.related)}</h2></div>${cards(draft.products.filter((item) => item.id !== p.id).slice(0, 3))}</section>`
      : `<section class="chapter wrap"><h1>${esc(ui.noProducts)}</h1></section>`;
  }
  if (page === 'contact') {
    const waDigits = (company.whatsapp || '').replace(/[^0-9]/g, '');
    content = `<div class="wrap"><header class="page-heading"><span class="eyebrow">${esc(ui.contact)}</span><h1>${esc(ui.conversation)}</h1><p>${esc(ui.contactIntro)}</p></header><section class="contact-layout"><div class="contact-details">${company.contactName ? `<h3>${esc(company.contactName)}</h3>` : ''}<p><strong>${esc(company.name)}</strong></p><p>${esc(ui.emailDirect)}<br><a class="text-link" href="mailto:${esc(company.email)}">${esc(company.email)}</a></p>${company.phone ? `<p style="margin-top:12px">Phone<br><a class="text-link" href="tel:${esc(company.phone)}">${esc(company.phone)}</a></p>` : ''}${waDigits ? `<p style="margin-top:12px">WhatsApp<br><a class="text-link" target="_blank" rel="noopener noreferrer" href="https://wa.me/${esc(waDigits)}">+${esc(waDigits)} (Chat Now ↗)</a></p>` : ''}${company.address ? `<p style="margin-top:12px">Address<br><span>${esc(company.address)}</span></p>` : ''}</div><form id="inquiry" action="${esc(safeUrl(options.inquiryUrl))}" method="post" class="form-grid"><label class="field">${esc(ui.name)}<input name="name" autocomplete="name" required maxlength="120"></label><label class="field">${esc(ui.email)}<input name="email" type="email" autocomplete="email" required maxlength="254"></label><label class="field full">${esc(ui.company)} (${esc(ui.optional)})<input name="company" autocomplete="organization" maxlength="200"></label><label class="field full">${esc(ui.product)} (${esc(ui.optional)})<select name="productId"><option value="">—</option>${draft.products.map((p) => `<option value="${esc(p.id)}"${p.id === options.productId ? ' selected' : ''}>${esc(translate(p).name)}</option>`).join('')}</select></label><label class="field full">${esc(ui.message)}<textarea name="message" required maxlength="5000" rows="5"></textarea></label><div class="honeypot" aria-hidden="true"><label>Website<input name="website" tabindex="-1" autocomplete="off"></label></div><button class="button" type="submit"${options.preview ? ' disabled' : ''}>${esc(ui.send)} ↗</button><p class="form-status" role="status" aria-live="polite"></p></form></section></div>`;
  }
  const socials = (['linkedin', 'facebook', 'instagram', 'x'] as const)
    .map((k) => {
      const url = safeUrl(company[k] || '');
      return url
        ? `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${k === 'linkedin' ? 'LinkedIn' : k === 'x' ? 'X' : k === 'facebook' ? 'Facebook' : 'Instagram'}</a>`
        : '';
    })
    .join('');
  const languageLinks = draft.languages
    .map((l) => {
      const target =
        page === 'detail' && options.productId ? productPath(options.productId) : navPath(page);
      return `<a href="${depth}../${l}/${target}" lang="${l}" data-wr-lang="${l}" aria-current="${l === lang}">${l.toUpperCase()}</a>`;
    })
    .join('');
  const logo = asset(company.logoAssetId);
  const brand = logo ? `<img src="${esc(logo)}" alt="${esc(company.name)}">` : esc(company.name);
  const script = `(()=>{const motion=matchMedia('(prefers-reduced-motion: reduce)'),v=document.getElementById('hero-video'),toggle=document.getElementById('video-toggle');const labels=${json({ pause: ui.pause, play: ui.play, sending: ui.sending, sent: ui.sent, failed: ui.failed, send: ui.send })};function update(){document.body.classList.toggle('reduced-motion',motion.matches);if(v){v.muted=true;if(motion.matches)v.pause();else v.play().catch(()=>{});}if(toggle){toggle.textContent=v&&v.paused?'▶':'Ⅱ';toggle.setAttribute('aria-label',v&&v.paused?labels.play:labels.pause);}}motion.addEventListener('change',update);update();toggle?.addEventListener('click',()=>{if(!v)return;if(v.paused){document.body.classList.remove('reduced-motion');v.play().catch(()=>{});}else v.pause();toggle.textContent=v.paused?'▶':'Ⅱ';toggle.setAttribute('aria-label',v.paused?labels.play:labels.pause);});if('IntersectionObserver' in window&&!motion.matches){document.body.classList.add('wr-motion-ready');const ro=new IntersectionObserver((entries)=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('wr-revealed');ro.unobserve(e.target);}});},{threshold:0.12});document.querySelectorAll('[data-reveal]').forEach(el=>{const rect=el.getBoundingClientRect();if(rect.top<window.innerHeight&&rect.bottom>0){el.classList.add('wr-revealed');}else{ro.observe(el);}});const bo=new IntersectionObserver((entries)=>{entries.forEach(e=>{if(e.isIntersecting){const val=e.target.getAttribute('data-progress');if(val)e.target.style.width=val+'%';bo.unobserve(e.target);}});},{threshold:0.15});document.querySelectorAll('.wr-progress-bar[data-progress]').forEach(el=>bo.observe(el));const co=new IntersectionObserver((entries)=>{entries.forEach(e=>{if(e.isIntersecting){const target=parseFloat(e.target.getAttribute('data-counter')||'0');const suffix=e.target.getAttribute('data-suffix')||'';const duration=1200;const start=performance.now();function tick(now){const p=Math.min((now-start)/duration,1);const ease=1-Math.pow(1-p,3);const cur=Math.floor(ease*target);e.target.textContent=cur.toLocaleString()+suffix;if(p<1)requestAnimationFrame(tick);else e.target.textContent=target.toLocaleString()+suffix;}requestAnimationFrame(tick);co.unobserve(e.target);}});},{threshold:0.15});document.querySelectorAll('[data-counter]').forEach(el=>co.observe(el));}else{document.querySelectorAll('[data-reveal]').forEach(el=>el.classList.add('wr-revealed'));document.querySelectorAll('.wr-progress-bar[data-progress]').forEach(el=>{el.style.width=el.getAttribute('data-progress')+'%';});}const form=document.getElementById('inquiry');if(form&&!${Boolean(options.preview)}){const p=new URL(location.href).searchParams.get('productId');if(p&&Array.from(form.productId.options).some(o=>o.value===p))form.productId.value=p;let requestId=crypto.randomUUID();let submitted='';form.addEventListener('submit',async event=>{event.preventDefault();if(!form.reportValidity())return;const button=form.querySelector('button[type=submit]'),status=form.querySelector('[role=status]');button.disabled=true;button.textContent=labels.sending;const fields=Object.fromEntries(new FormData(form));const serialized=JSON.stringify(fields);if(submitted&&submitted!==serialized)requestId=crypto.randomUUID();submitted=serialized;try{const response=await fetch(form.action,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...fields,requestId})});if(!response.ok)throw Error();status.textContent=labels.sent;form.reset();requestId=crypto.randomUUID();submitted='';}catch{status.textContent=labels.failed;}finally{button.disabled=false;button.textContent=labels.send+' ↗';}});}})();`;
  const isSenseng = template === 'senseng-clean' || template === 'senseng-video';
  if (isSenseng) {
    const ctx = buildThemeContext(draft, options);
    const bodyHtml = draft.materials?materialsSensengBody(ctx):renderSensengPage(ctx, template === 'senseng-video');
    if(draft.materials){
      const seo=materialsSeo(draft,options)!;
      return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(seo.title)}</title><meta name="description" content="${esc(seo.description)}">${options.preview?'<meta name="robots" content="noindex,nofollow">':''}<style>${styles}\n${themeStyles}</style>${materialsThemeStyle(draft)}</head><body class="${template} wr-materials-site" data-template="${template}" style="--brand:${color};--brand-ink:${brandInk}">${bodyHtml}<script>${script}</script></body></html>`;
    }
    return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(page === 'home' ? company.name : `${page === 'detail' ? translate(draft.products.find((p) => p.id === options.productId) ?? mainProduct ?? ({ name: ui.product, description: '' } as Product)).name : ui[page as 'home' | 'catalog' | 'about' | 'contact']} · ${company.name}`)}</title><meta name="description" content="${esc(copy.subtitle)}">${options.preview ? '<meta name="robots" content="noindex,nofollow">' : ''}<style>${styles}\n${themeStyles}</style></head><body class="${template}" data-template="${template}" style="--brand:${color};--brand-ink:${brandInk}">${options.preview ? `<div class="preview-bar">${esc(ui.preview)}</div>` : ''}${bodyHtml}<script>${script}</script></body></html>`;
  }
  if (template === 'senseng-candy') {
    const ctx = buildThemeContext(draft, options);
    const bodyHtml = renderCandyPage(ctx);
    return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(page === 'home' ? company.name : `${page === 'detail' ? translate(draft.products.find((p) => p.id === options.productId) ?? mainProduct ?? ({ name: ui.product, description: '' } as Product)).name : ui[page as 'home' | 'catalog' | 'about' | 'contact']} · ${company.name}`)}</title><meta name="description" content="${esc(copy.subtitle)}">${options.preview ? '<meta name="robots" content="noindex,nofollow">' : ''}<style>${styles}\n${themeStyles}</style></head><body class="${template}" data-template="${template}" style="--brand:${color};--brand-ink:${brandInk}">${options.preview ? `<div class="preview-bar">${esc(ui.preview)}</div>` : ''}${bodyHtml}<script>${script}</script></body></html>`;
  }
  if (template === 'senseng-wonder') {
    const ctx = buildThemeContext(draft, options);
    const bodyHtml = renderWonderPage(ctx);
    return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(page === 'home' ? company.name : `${page === 'detail' ? translate(draft.products.find((p) => p.id === options.productId) ?? mainProduct ?? ({ name: ui.product, description: '' } as Product)).name : ui[page as 'home' | 'catalog' | 'about' | 'contact']} · ${company.name}`)}</title><meta name="description" content="${esc(copy.subtitle)}">${options.preview ? '<meta name="robots" content="noindex,nofollow">' : ''}<style>${styles}\n${themeStyles}</style></head><body class="${template}" data-template="${template}" style="--brand:${color};--brand-ink:${brandInk}">${options.preview ? `<div class="preview-bar">${esc(ui.preview)}</div>` : ''}${bodyHtml}<script>${script}</script></body></html>`;
  }
  if (template === 'senseng-arcade') {
    const ctx = buildThemeContext(draft, options);
    const bodyHtml = renderArcadePage(ctx);
    return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(page === 'home' ? company.name : `${page === 'detail' ? translate(draft.products.find((p) => p.id === options.productId) ?? mainProduct ?? ({ name: ui.product, description: '' } as Product)).name : ui[page as 'home' | 'catalog' | 'about' | 'contact']} · ${company.name}`)}</title><meta name="description" content="${esc(copy.subtitle)}">${options.preview ? '<meta name="robots" content="noindex,nofollow">' : ''}<style>${styles}\n${themeStyles}</style></head><body class="${template}" data-template="${template}" style="--brand:${color};--brand-ink:${brandInk}">${options.preview ? `<div class="preview-bar">${esc(ui.preview)}</div>` : ''}${bodyHtml}<script>${script}</script></body></html>`;
  }
  if (template === 'senseng-nature') {
    const ctx = buildThemeContext(draft, options);
    const bodyHtml = renderNaturePage(ctx);
    return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(page === 'home' ? company.name : `${page === 'detail' ? translate(draft.products.find((p) => p.id === options.productId) ?? mainProduct ?? ({ name: ui.product, description: '' } as Product)).name : ui[page as 'home' | 'catalog' | 'about' | 'contact']} · ${company.name}`)}</title><meta name="description" content="${esc(copy.subtitle)}">${options.preview ? '<meta name="robots" content="noindex,nofollow">' : ''}<style>${styles}\n${themeStyles}</style></head><body class="${template}" data-template="${template}" style="--brand:${color};--brand-ink:${brandInk}">${options.preview ? `<div class="preview-bar">${esc(ui.preview)}</div>` : ''}${bodyHtml}<script>${script}</script></body></html>`;
  }
  if (template === 'senseng-minimal') {
    const ctx = buildThemeContext(draft, options);
    const bodyHtml = renderMinimalPage(ctx);
    return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(page === 'home' ? company.name : `${page === 'detail' ? translate(draft.products.find((p) => p.id === options.productId) ?? mainProduct ?? ({ name: ui.product, description: '' } as Product)).name : ui[page as 'home' | 'catalog' | 'about' | 'contact']} · ${company.name}`)}</title><meta name="description" content="${esc(copy.subtitle)}">${options.preview ? '<meta name="robots" content="noindex,nofollow">' : ''}<style>${styles}\n${themeStyles}</style></head><body class="${template}" data-template="${template}" style="--brand:${color};--brand-ink:${brandInk}">${options.preview ? `<div class="preview-bar">${esc(ui.preview)}</div>` : ''}${bodyHtml}<script>${script}</script></body></html>`;
  }
  if (isReferenceTemplate(template)) return renderReferencePage(draft, { ...options, page }, content, script);
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(page === 'home' ? company.name : `${page === 'detail' ? translate(draft.products.find((p) => p.id === options.productId) ?? mainProduct ?? ({ name: ui.product, description: '' } as Product)).name : ui[page as 'home' | 'catalog' | 'about' | 'contact']} · ${company.name}`)}</title><meta name="description" content="${esc(copy.subtitle)}">${options.preview ? '<meta name="robots" content="noindex,nofollow">' : ''}<style>${styles}\n${themeStyles}</style></head><body class="${template}" data-template="${template}" style="--brand:${color};--brand-ink:${brandInk}">${options.preview ? `<div class="preview-bar">${esc(ui.preview)}</div>` : ''}<a class="skip" href="#main">${esc(ui.skip)}</a><header class="wrap nav"><a class="brand" href="${path('index.html')}" ${navAttrs('home')}>${brand}</a><nav aria-label="${esc(ui.menu)}">${navLink('home', ui.home)}${navLink('catalog', ui.catalog)}${navLink('about', ui.about)}${navLink('contact', ui.contact)}</nav><div class="languages" aria-label="${esc(ui.language)}">${languageLinks}</div></header><main id="main">${content}</main><footer class="footer wrap"><div class="footer-top"><a class="brand" href="${path('index.html')}" ${navAttrs('home')}>${esc(company.name)}</a><div class="socials">${socials}</div><a class="text-link" href="mailto:${esc(company.email)}">${esc(company.email)}</a></div><div class="footer-bottom"><span>© ${new Date().getUTCFullYear()} ${esc(company.name)}</span><span>${esc(ui.rights)}</span></div></footer><script>${script}</script></body></html>`;
}
export function renderSiteFiles(
  draft: Draft,
  options: Omit<RenderOptions, 'lang' | 'page'> & { publicBaseUrl: string },
): Record<string, string> {
  if (options.preview) throw Error('Private preview cannot be exported');
  const files: Record<string, string> = {};
  for (const lang of draft.languages) {
    for (const page of ['home', 'catalog', 'about', 'contact'])
      files[`${lang}/${page === 'home' ? 'index.html' : `${page}/index.html`}`] = renderSite(
        draft,
        { ...options, lang, page },
      );
    for (const product of draft.products)
      files[`${lang}/${productPath(product.id)}`] = renderSite(draft, {
        ...options,
        lang,
        page: 'detail',
        productId: product.id,
      });
  }
  files['index.html'] =
    `<!doctype html><html lang="en"><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=en/index.html"><title>${esc(draft.company.name)}</title><a href="en/index.html">${esc(draft.company.name)}</a></html>`;
  files['index.html'] = withFavicon(files['index.html'], draft, options.assetUrl);
  return files;
}
