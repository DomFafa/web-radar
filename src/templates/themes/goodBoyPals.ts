import type { Product } from '../../shared/model';
import { esc, productPath, type ThemeContext } from './types';
import { goodBoyReference as reference } from './goodBoyReference';
import { goodBoyBaseStyles } from './goodBoyStyles';
export { goodBoyRuntime } from './goodBoyRuntime';
const base = '/templates/good-boy-pals/';
const names = [
  'Tough Tug Rope',
  'Grain-Free Salmon Kibble',
  'Feather Wand Teaser',
  'Waxed Canvas Lead',
];
const descriptions = [
  'Recycled cotton, survives the terriers.',
  'Made in Somerset, 2kg bag.',
  'The one cats actually chase.',
  'Brass clip, lasts for years.',
];
/** Reference examples are supplied to template demos only, never saved to customer projects. */
export const goodBoyExampleProducts = (): Product[] =>
  names.map((name, i) => ({
    id: `example-${i}`,
    name,
    description: descriptions[i],
    material: '',
    dimensions: '',
    imageAssetId: base + 'products-ySaSl_zq.webp',
  }));
export function renderGoodBoyPage(ctx: ThemeContext): string {
  const { draft, options, page, path, navPath, navAttrs, asset, translateProduct: translate } = ctx;
  const c = draft.company;
  const demo = ['preview', 'materials-demo', 'good-boy-demo'].includes(options.projectId);
  const name = c.name || 'Good Boy Supply Co.';
  const brand = demo && (!c.name || c.name === 'Good Boy Supply Co.') ? 'Good Boy' : name;
  const copy = draft.copy[ctx.lang];
  const products = draft.products.length ? draft.products : demo ? goodBoyExampleProducts() : [];
  const route = (p: string, label: string, cls = '', id?: string) =>
    `<a class="${cls}" href="${path(p === 'detail' ? productPath(id) : navPath(p))}${p === 'contact' && id ? '?productId=' + encodeURIComponent(id) : ''}" ${navAttrs(p, id)}>${label}</a>`;
  const link = (p: string, label: string, cls = '', id?: string) => route(p, esc(label), cls, id);
  const anchor = (id: string, label: string) =>
    `<a href="${page === 'home' ? '#' + id : path('index.html') + '#' + id}">${esc(label)}</a>`;
  const fragment = (key: keyof typeof reference) =>
    reference[key]
      .replaceAll('{{catalog}}', path(navPath('catalog')))
      .replaceAll('{{home}}', path('index.html'));
  const photo = (url: string, alt: string, cls = '', eager = false) =>
    `<img src="${esc(url)}" alt="${esc(alt)}" class="${cls}" width="1024" height="1024" loading="${eager ? 'eager' : 'lazy'}" decoding="async"${eager ? ' fetchpriority="high"' : ''}>`;
  const productPicture = (p: Product, i: number, main = false) =>
    demo && p.id === `example-${i}`
      ? `<div class="gb-product-picture" role="img" aria-label="${esc(translate(p).name)}" style="background-image:url(${base}products-ySaSl_zq.webp);background-size:400% 100%;background-position:${(i * 100) / 3}% 0;background-color:var(--${['pale-blue', 'pale-yellow', 'pale-pink', 'pale-mint'][i]})"></div>`
      : asset(p.imageAssetId)
        ? photo(asset(p.imageAssetId), translate(p).name, 'gb-product-picture', main).replace(
            '<img ',
            main ? '<img id="wr-detail-main-img" data-wr-product-image ' : '<img ',
          )
        : `<div class="gb-product-picture gb-placeholder" role="img" aria-label="${esc(translate(p).name)}: image pending">Product image</div>`;
  const cards = (items = products) =>
    `<div class="gb-products">${items
      .map((p) => {
        const i = products.indexOf(p);
        const body = `${demo && p.id === 'example-1' ? '<span class="gb-staff">Staff fave</span>' : ''}${productPicture(p, i)}<div class="gb-product-copy"><h3>${esc(translate(p).name)}</h3><p>${esc(p.tagline || translate(p).description)}</p><div>${demo && p.id.startsWith('example-') ? `<span class="gb-price">£${[9, 18, 6, 24][i]}</span>` : ''}<span class="label-text underline">View</span></div></div>`;
        return route('detail', body, 'ink-card gb-product', p.id).replace(
          'class="ink-card',
          `data-gb-product="${esc(translate(p).name.toLowerCase())}" class="ink-card`,
        );
      })
      .join(
        '',
      )}</div>${!items.length ? '<p class="gb-empty">Our collection is being prepared. Get in touch for product information.</p>' : ''}`;
  const categories = () => {
    let html = fragment('categories');
    if (!demo) html = html.replace(/\d+ products/g, 'Explore the collection');
    return html;
  };
  const why = () => {
    if (demo) return fragment('why');
    const points = (c.capabilities || '')
      .split(/[\n;；]/)
      .filter(Boolean)
      .slice(0, 3);
    const titles = ['Get to know the collection', 'Find the right fit', 'Talk to our team'];
    const texts = [
      'Explore our products and their available details.',
      'Tell us what you are looking for and ask about the options.',
      'Contact us to discuss availability, delivery and your questions.',
    ];
    let html = fragment('why').replace('Why shop local?', 'A little care. A lot of good.');
    ['We know the food', 'Free delivery nearby', 'Loyalty that adds up'].forEach(
      (t, i) => (html = html.replace(t, () => esc(points[i] || titles[i]))),
    );
    [
      "Every food on our shelves has been checked by our team, and we'll help you switch slowly.",
      'Heavy bags delivered free within three miles of the shop.',
      'Your tenth bag of food is on us. No app, just a stamp card.',
    ].forEach((t, i) => (html = html.replace(t, () => esc(texts[i]))));
    return html;
  };
  const wash = () => {
    let html = fragment('wash');
    if (!demo)
      html = html
        .replace('The self-wash', 'Everyday care')
        .replace(
          /Muddy dog\? <span[^>]*>.*?<\/span>/,
          'Good things for <span class="italic text-primary">their everyday adventures.</span>',
        )
        .replace(
          'Raised tubs, warm water, dog shampoo, towels and a blow dryer. You wash, we clean up.',
          () =>
            esc(
              c.description ||
                'Share what your companion needs and ask our team about the available products and care options.',
            ),
        )
        .replace(/<ul\b[^>]*>[\s\S]*?<\/ul>/, '')
        .replace('See opening times', 'Get in touch')
        .replace('href="#visit"', `href="${path(navPath('contact'))}" ${navAttrs('contact')}`)
        .replace('No mess at home!', 'Happy little moments!');
    return html;
  };
  const visit = () => {
    if (demo) return fragment('visit');
    return `<section class="gb-visit bg-primary" id="visit"><div class="gb-wrap gb-two"><div><h2 class="h2-display">Come say hi.<br>Bring the questions.</h2><p>${esc(name)}${c.address ? '<br>' + esc(c.address) : ''}</p>${link('contact', 'Get in touch →', 'btn-press bg-background')}</div><div class="ink-card gb-contact-card"><h3>Let’s talk.</h3>${c.email ? `<a href="mailto:${esc(c.email)}">${esc(c.email)}</a>` : ''}${c.phone ? `<a href="tel:${esc(c.phone.replace(/[^+\d]/g, ''))}">${esc(c.phone)}</a>` : ''}${c.whatsapp ? `<a href="https://wa.me/${esc(c.whatsapp.replace(/\D/g, ''))}" target="_blank" rel="noopener noreferrer">WhatsApp ↗</a>` : ''}<p>Contact us to confirm opening times and availability.</p></div></div></section>`;
  };
  const title = (eyebrow: string, heading: string, description = '') =>
    `<section class="gb-page-heading bg-primary" data-wr-hero><div class="gb-wrap"><p class="label-text">${esc(eyebrow)}</p><h1 class="h2-display">${esc(heading)}</h1>${description ? '<p>' + esc(description) + '</p>' : ''}</div></section>`;
  let content = '';
  if (page === 'home') {
    let hero = fragment('hero');
    if (copy?.headline || c.slogan)
      hero = hero.replace(
        /<h1\b[^>]*>[\s\S]*?<\/h1>/,
        () => `<h1 class="h1-display">${esc(copy?.headline || c.slogan)}</h1>`,
      );
    if (copy?.subtitle || c.description)
      hero = hero.replace(
        "An independent pet shop in Bristol with real food, sturdy toys and people who actually know your dog's name.",
        () => esc(copy?.subtitle || c.description),
      );
    if (copy?.cta) hero = hero.replace('Shop online ', () => esc(copy.cta) + ' ');
    if (!demo)
      hero = hero
        .replace('Since 2014', () => esc(c.establishedYear || 'Hello, good friend!'))
        .replace('Treats at the till!', 'For happy companions!');
    const spotlight = demo
      ? fragment('spotlight')
      : products.length
        ? `<section class="gb-wrap gb-two gb-spotlight"><figure>${productPicture(products[0], 0)}</figure><div><p class="label-text text-blue">IN THE SPOTLIGHT</p><h2 class="h2-display">${esc(translate(products[0]).name)}</h2><p>${esc(translate(products[0]).description)}</p>${link('detail', 'Take a closer look →', 'btn-press bg-primary', products[0].id)}</div></section>`
        : '';
    content = `${hero}${categories()}<section class="gb-wrap gb-featured"><h2 class="h2-display">What we'd buy (and do).</h2>${cards(products.slice(0, 4))}</section>${wash()}${why()}${spotlight}${demo ? fragment('reviews') : ''}${visit()}`;
  }
  if (page === 'catalog')
    content = `${title('The good stuff', 'Little things. Big happy.', 'Explore our collection and find something for your companion.')}<section class="gb-wrap gb-catalog"><div class="gb-search"><label for="gb-search">Find a product</label><input id="gb-search" type="search" data-gb-search placeholder="Search the collection"><p><span data-gb-results>${products.length}</span> products</p></div>${cards()}<p data-gb-empty hidden>No matching products. Try another search.</p></section>${visit()}`;
  if (page === 'detail') {
    const p = products.find((p) => p.id === options.productId);
    content = p
      ? `<section class="gb-wrap gb-two gb-detail"><div>${productPicture(p, products.indexOf(p), true)}<div class="gb-gallery">${(
          p.gallery || []
        )
          .filter((g) => asset(g.assetId))
          .map((g) => photo(asset(g.assetId), g.caption || translate(p).name))
          .join(
            '',
          )}</div></div><div>${link('catalog', '← Back to the collection', 'label-text')}<p class="label-text text-blue">THE GOOD STUFF</p><h1 class="h2-display">${esc(translate(p).name)}</h1><p>${esc(translate(p).description)}</p>${p.sellingPoints?.length ? '<ul>' + p.sellingPoints.map((t) => '<li>✓ ' + esc(t) + '</li>').join('') + '</ul>' : ''}<dl>${p.material ? `<dt>Material</dt><dd>${esc(p.material)}</dd>` : ''}${p.dimensions ? `<dt>Dimensions</dt><dd>${esc(p.dimensions)}</dd>` : ''}</dl>${link('contact', 'Ask about this product →', 'btn-press bg-blue text-background', p.id)}</div></section><section class="gb-wrap gb-featured"><h2 class="h2-display">More good things.</h2>${cards(products.filter((q) => q.id !== p.id).slice(0, 4))}</section>`
      : `${title('The collection', 'Product not found')}<section class="gb-wrap gb-catalog">${link('catalog', 'Back to the collection →', 'btn-press bg-primary')}</section>`;
  }
  if (page === 'about')
    content = `${title('Hello from ' + name, c.aboutHeadline || 'Small shop. Big heart.', copy?.about || c.aboutStory || c.description || 'Good things begin with getting to know the companion in front of you.')}<section class="gb-wrap gb-two gb-about"><div>${photo(asset(c.aboutImageAssetId) || base + 'biscuit-D6v5sNq3.jpg', c.aboutImageAssetId ? 'Our shop' : 'Illustrative terrier in a pet shop')}</div><div><h2 class="h2-display">For their everyday happiness.</h2><p>${esc(c.aboutHighlights || 'Explore the collection, share what you need and get to know our team.')}</p>${c.contactName ? `<p>Your contact: ${esc(c.contactName)}</p>` : ''}${c.certifications ? `<p>${esc(c.certifications)}</p>` : ''}${link('contact', 'Come say hello →', 'btn-press bg-primary')}</div></section>${why()}<section class="gb-wrap gb-about gb-two"><div><h2 class="h2-display">Good to know.</h2><p>Ask us about the details before you visit or order.</p></div><div class="gb-faq"><details id="delivery"><summary>Do you offer local delivery?</summary><p>${demo ? 'Heavy bags delivered free within three miles of the shop. Free local delivery over £30.' : 'Contact our team to confirm delivery areas, charges and availability.'}</p></details><details id="loyalty"><summary>Is there a loyalty programme?</summary><p>${demo ? 'Your tenth bag of food is on us. No app, just a stamp card.' : 'Ask our team about current offers and any available loyalty programme.'}</p></details><details><summary>How can I find the right product?</summary><p>Tell us about your companion and what you are looking for. We can discuss the available options.</p></details></div></section>${visit()}`;
  if (page === 'contact')
    content = `${title('A friendly hello', 'Good questions. Happy companions.', 'Ask about products, delivery or visiting the shop.')}<section class="gb-wrap gb-two gb-contact"><aside><h2 class="h2-display">Come say hi.</h2><p>${esc(name)}</p>${c.contactName ? '<p>' + esc(c.contactName) + '</p>' : ''}${c.email ? `<a href="mailto:${esc(c.email)}">${esc(c.email)}</a>` : ''}${c.phone ? `<a href="tel:${esc(c.phone.replace(/[^+\d]/g, ''))}">${esc(c.phone)}</a>` : ''}${c.address ? '<p>' + esc(c.address) + '</p>' : ''}${photo(base + 'pet-dog-Ho6FpIwO.webp', 'Illustrative puppy portrait', 'gb-contact-dog')}</aside><div class="ink-card gb-contact-card"><h2 class="font-display text-3xl">Let’s talk.</h2><p>Leave a message and we’ll get back to you.</p>${ctx.inquiryFormHtml}</div></section>`;
  const nav = `${link('catalog', 'Dogs')}${link('catalog', 'Cats')}${link('catalog', 'Small pets')}${anchor('wash', demo ? 'Self-wash' : 'Pet care')}${link('about', 'About')}`;
  const bone =
    '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M17 10c.7-.7 1.69 0 2.5 0a2.5 2.5 0 1 0 0-5 .5.5 0 0 1-.5-.5 2.5 2.5 0 1 0-5 0c0 .81.7 1.8 0 2.5l-7 7c-.7.7-1.69 0-2.5 0a2.5 2.5 0 0 0 0 5c.28 0 .5.22.5.5a2.5 2.5 0 1 0 5 0c0-.81-.7-1.8 0-2.5Z"/></svg>';
  const brandHtml = c.logoAssetId ? ctx.brandLogo : bone + ' ' + esc(brand);
  const announcement = demo
    ? 'Free local delivery over £30 · Self-wash open 7 days · Loyalty card: 10th bag of food free · Dogs welcome inside · '
    : `${esc(c.slogan || name)} · ${esc(c.capabilities || 'Discover the collection · Get in touch')} · `;
  const menuIcon =
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 5h16M4 12h16M4 19h16"/></svg>';
  const aboutAnchor = (id: string, label: string) =>
    `<a href="${path(navPath('about'))}#${id}">${label}</a>`;
  return `<a class="gb-skip" href="#main">Skip to content</a><div class="overflow-x-hidden"><div class="flex h-10 items-center overflow-hidden bg-blue text-background label-text" aria-hidden="true"><div class="flex animate-marquee whitespace-nowrap">${Array.from({ length: 6 }, () => '<span class="px-2">' + announcement + '</span>').join('')}</div></div><header class="gb-header bg-background"><div class="gb-wrap gb-header-inner">${route('home', brandHtml, 'gb-brand')}<nav aria-label="Main navigation">${nav}</nav><div class="gb-header-actions">${draft.languages.length > 1 ? '<div class="gb-languages">' + ctx.languageLinks + '</div>' : ''}${link('catalog', 'Visit the shop', 'btn-press bg-primary gb-shop-button')}<details class="gb-menu" data-gb-menu data-wr-mobile-menu><summary aria-label="Open menu" class="btn-press bg-primary">${menuIcon}</summary><nav aria-label="Mobile navigation">${nav}${link('contact', 'Contact')}</nav></details></div></div></header><main id="main">${content}</main><footer class="bg-foreground text-background gb-footer"><div class="gb-wrap"><p class="gb-wordmark font-display text-primary">${demo && brand === 'Good Boy' ? 'GOOD BOY' : esc(brand)}</p><div>${link('catalog', 'Shop')}${anchor('wash', demo ? 'Self-wash' : 'Pet care')}${aboutAnchor('delivery', 'Delivery')}${aboutAnchor('loyalty', 'Loyalty card')}${link('about', 'About')}${link('contact', 'Contact')}${ctx.socials}${demo && !ctx.socials ? '<a href="#main">Instagram</a>' : ''}<span>© ${new Date().getUTCFullYear()} ${esc(name)}</span></div></div></footer></div>`;
}

export const goodBoyStyles =
  goodBoyBaseStyles +
  `
body.wr-materials-site.good-boy-pals{--primary:var(--wr-accent);--blue:var(--wr-secondary);--background:var(--wr-background);--foreground:var(--wr-ink);--border:var(--wr-ink);--muted-foreground:var(--wr-muted)}.gb-placeholder{display:grid;place-items:center;font-size:14px;color:var(--muted-foreground)}html{scroll-behavior:smooth;scroll-padding-top:20px}body{margin:0}button,summary{cursor:pointer}a:focus-visible,button:focus-visible,summary:focus-visible,input:focus-visible,textarea:focus-visible,select:focus-visible{outline:3px solid var(--blue);outline-offset:5px}[hidden]{display:none!important}h1,h2,h3,p,a,dd{overflow-wrap:break-word}.gb-wrap{max-width:1280px;margin:auto;padding-left:20px;padding-right:20px}.gb-header-inner{height:84px;display:flex;align-items:center;justify-content:space-between;gap:16px}.gb-brand{min-width:0;overflow-wrap:anywhere;display:flex;align-items:center;gap:8px;font:800 24px 'Bricolage Grotesque',sans-serif;letter-spacing:-.025em}.gb-brand svg{transform:rotate(-45deg);flex-shrink:0}.gb-brand img{max-width:170px;max-height:50px;object-fit:contain}.gb-header nav{display:flex;gap:28px;font-size:15px;font-weight:800}.gb-header nav a:hover{color:var(--blue)}.gb-header-actions{display:flex;gap:14px;align-items:center}.gb-languages{display:flex;gap:6px;font-size:12px}.gb-menu{display:none;position:relative}.gb-menu summary{list-style:none;padding:12px}.gb-menu summary::-webkit-details-marker{display:none}.gb-menu[open] nav{display:flex}.gb-menu nav{position:absolute;z-index:30;right:0;top:60px;min-width:230px;background:var(--background);border:2px solid var(--border);border-radius:20px;box-shadow:var(--shadow-hard);padding:24px;flex-direction:column;gap:16px}.gb-featured{padding-top:16px;padding-bottom:128px}.gb-featured>h2{max-width:672px}.gb-products{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:24px;margin-top:40px}.gb-product{display:flex;flex-direction:column;position:relative;border-radius:24px;padding:12px;min-width:0}.gb-product-picture{aspect-ratio:3/4;width:100%;border-radius:16px;border:2px solid var(--border);object-fit:contain;background-repeat:no-repeat;background-color:var(--pale-blue)}.gb-product-copy{display:flex;flex:1;flex-direction:column;padding:16px 4px 4px}.gb-product h3{font:800 20px/1.25 'Bricolage Grotesque',sans-serif}.gb-product p{margin-top:4px;font-size:14px;color:var(--muted-foreground);line-height:1.5}.gb-product-copy>div{margin-top:auto;padding-top:16px;display:flex;align-items:center;justify-content:space-between;gap:10px}.gb-price{font:800 24px 'Bricolage Grotesque',sans-serif}.gb-staff{position:absolute;z-index:2;right:-20px;top:-28px;width:128px;height:128px;background:var(--pink);border:2px solid var(--border);box-shadow:var(--shadow-hard);border-radius:50%;display:grid;place-items:center;font-weight:800;transform:rotate(-10deg)}.gb-two{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:56px;align-items:center}.gb-two>*{min-width:0}.gb-spotlight{padding-bottom:96px}.gb-spotlight p{margin:24px 0}.gb-spotlight figure{max-width:380px;margin:auto;width:100%}.gb-visit{padding-top:80px;padding-bottom:96px}.gb-visit p{margin:24px 0}.gb-contact-card{background:var(--background);border-radius:28px;padding:32px}.gb-contact-card h3{font:800 28px 'Bricolage Grotesque',sans-serif}.gb-contact-card>a{display:block;margin-top:12px}.gb-page-heading{padding:64px 0 72px}.gb-page-heading h1{margin:20px 0;max-width:950px}.gb-page-heading p{max-width:680px}.gb-catalog,.gb-about,.gb-contact{padding-top:80px;padding-bottom:96px}.gb-search{max-width:500px}.gb-search label{display:block;font-weight:800}.gb-search input{margin:12px 0;width:100%;border:2px solid var(--border);border-radius:20px;background:var(--background);padding:14px 20px}.gb-search p{font-size:14px}.gb-empty{padding:48px 0}.gb-detail{align-items:start;padding-top:80px;padding-bottom:96px}.gb-detail>div>p{margin:24px 0}.gb-detail h1{margin:24px 0;font-size:clamp(40px,5vw,72px)}.gb-detail ul{list-style:none;margin:24px 0}.gb-detail li{margin:12px 0}.gb-detail dl{margin:24px 0;display:grid;grid-template-columns:auto 1fr;gap:12px}.gb-detail dt{font-weight:800}.gb-gallery{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;margin-top:20px}.gb-gallery img,.gb-about img{aspect-ratio:1;object-fit:cover;border:2px solid var(--border);border-radius:28px}.gb-about p{margin:24px 0}.gb-faq details{border:2px solid var(--border);border-radius:20px;padding:20px;margin-bottom:16px}.gb-faq summary{font-weight:800}.gb-contact{align-items:start}.gb-contact aside>a{display:block;margin:12px 0}.gb-contact aside>p{margin:20px 0}.gb-contact-dog{max-width:250px;margin-top:30px}.gb-contact-card>p{margin:20px 0}.form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px;margin-top:30px}.field{display:flex;flex-direction:column;gap:8px;min-width:0;font-weight:800}.field input,.field textarea,.field select{width:100%;font-weight:400;padding:12px 14px;border:2px solid var(--border);border-radius:14px;background:var(--background);color:var(--foreground);font:inherit}.field.full,.form-status{grid-column:1/-1}.honeypot{position:absolute;left:-10000px}.form-grid button{grid-column:1/-1;justify-self:start;background:var(--blue);color:var(--background);border:2px solid var(--border);box-shadow:var(--shadow-hard);padding:14px 24px;border-radius:999px;font-weight:800}.form-grid button:disabled{opacity:.5;cursor:not-allowed}.gb-footer{padding:64px 0 40px}.gb-wordmark{text-align:center;font-size:18vw;font-weight:800;line-height:.85;letter-spacing:-.05em;padding:0}.gb-footer .gb-wrap>div{margin-top:40px;border-top:1px solid #ffffff30;padding-top:24px;display:flex;gap:20px;align-items:center;flex-wrap:wrap;font-size:14px;font-weight:800}.gb-footer span{margin-left:auto;opacity:.7;font-size:13px;font-weight:400}.gb-skip{position:absolute;left:12px;top:-100px;z-index:40;background:var(--background);padding:12px}.gb-skip:focus{top:12px}.preview-bar{text-align:center;padding:10px;background:var(--pink);font-size:13px}
@media(min-width:1280px){.gb-wordmark{font-size:230px}}
@media(min-width:768px){.gb-wrap{padding-left:32px;padding-right:32px}}
@media(max-width:1023px) and (min-width:768px){.gb-products{grid-template-columns:repeat(3,minmax(0,1fr))}.gb-header nav{gap:14px}.gb-shop-button{padding:12px 16px}}
@media(max-width:767px){.gb-header nav,.gb-shop-button{display:none}.gb-menu{display:block}.gb-header-inner{height:84px}.gb-brand{font-size:24px;max-width:240px}.gb-two{grid-template-columns:1fr;gap:40px}.gb-products{grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.gb-product h3{font-size:18px}.gb-featured{padding-bottom:96px}.gb-staff{width:96px;height:96px;right:-12px;top:-22px;font-size:12px}.gb-detail,.gb-about,.gb-contact,.gb-catalog{padding-top:56px;padding-bottom:64px}.gb-gallery{gap:12px}.gb-contact-card{padding:24px}.form-grid{grid-template-columns:1fr}.gb-footer .gb-wrap>div{gap:16px}.gb-footer span{width:100%;margin-left:0}.gb-page-heading{padding:48px 0}.gb-detail h1{font-size:44px}.gb-wordmark{font-size:18vw}}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}.animate-marquee{animation:none}*{transition:none!important}}
`;
