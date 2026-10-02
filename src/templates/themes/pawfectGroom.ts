import type { Product } from '../../shared/model';
import { esc, productPath, type ThemeContext } from './types';

const base = '/templates/pawfect-groom/';
const scissors =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="m8 8 13 13M8 16 21 3"/></svg>';
const paw =
  '<svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true"><ellipse cx="9" cy="10" rx="3" ry="4" transform="rotate(-25 9 10)"/><ellipse cx="17" cy="7" rx="3" ry="4"/><ellipse cx="24" cy="11" rx="3" ry="4" transform="rotate(25 24 11)"/><path d="M8 23c0-4 5-10 9-10s9 6 9 10-5 4-9 3-9 1-9-3Z"/></svg>';
const examples = [
  [
    'The Bath & Dry',
    'A fresh start, from nose to tail.',
    'Shampoo, conditioning and a coat-friendly dry.',
    '35',
  ],
  [
    'Full Groom',
    'A little trim. A whole new spring in their step.',
    'A bath, dry and a cut discussed with your groomer.',
    '55',
  ],
  [
    'Puppy’s First Groom',
    'Little paws, gentle introductions.',
    'Talk to the salon about a first visit for your puppy.',
    '30',
  ],
  [
    'De-Shedding Treatment',
    'Less loose fluff. More happy cuddles.',
    'Ask about a brush-out suited to your dog’s coat.',
    '45',
  ],
  [
    'Nail Trim',
    'Small details, comfortable paws.',
    'Discuss nail clipping and filing with the team.',
    '12',
  ],
  [
    'Teeth Brushing',
    'A little extra care for their smile.',
    'Ask about the salon’s available dental hygiene options.',
    '10',
  ],
];
const FAQs = [
  [
    'How long does a groom take?',
    'Timing depends on your dog’s size, coat and selected service. Share these details when you enquire so the team can advise before your visit.',
  ],
  [
    'How will my dog be dried?',
    'Ask the salon about its drying methods and any individual needs. Drying arrangements should be confirmed directly before you book.',
  ],
  [
    'My dog is anxious — can you help?',
    'Tell the team about their temperament, sensitivities and previous grooming experience. They can discuss whether a suitable appointment is available.',
  ],
  [
    'How often should I book?',
    'The right interval depends on coat type, lifestyle and your dog’s needs. Your groomer can help you plan a suitable routine.',
  ],
];
export function renderPawfectPage(ctx: ThemeContext): string {
  const { draft, options, page, asset, path, navAttrs, navPath, translateProduct } = ctx;
  const c = draft.company;
  const showcase = options.projectId === 'preview' || options.projectId === 'pawfect-demo';
  const name = c.name || 'Pawfect Groom';
  const copy = draft.copy[ctx.lang];
  const route = (p: string, label: string, cls = '', id?: string) =>
    `<a class="${cls}" href="${path(p === 'detail' ? productPath(id) : navPath(p)) + (p === 'contact' && id ? '?productId=' + encodeURIComponent(id) : '')}" ${navAttrs(p, id)}${page === p ? ' aria-current="page"' : ''}>${esc(label)}</a>`;
  const button = (label = 'Request a groom') => route('contact', `${label} ↗`, 'pg-button');
  const photo = (url: string, alt: string, cls = '', eager = false) =>
    `<img class="${cls}" src="${esc(url)}" alt="${esc(alt)}" ${eager ? 'fetchpriority="high" loading="eager"' : 'loading="lazy"'} decoding="async" width="1200" height="1000">`;
  const image = (p?: Product) => asset(p?.imageAssetId) || base + 'poodle.jpg';
  const heading = (eyebrow: string, title: string, subtitle = '') =>
    `<div class="pg-section-title"><span class="pg-eyebrow">${esc(eyebrow)}</span><h2>${esc(title)}</h2>${subtitle ? `<p>${esc(subtitle)}</p>` : ''}</div>`;
  const services = () =>
    `<div class="pg-services">${draft.products.length ? draft.products.map((p, i) => `<article class="pg-service" data-reveal="fade-up"><span class="pg-number">${String(i + 1).padStart(2, '0')} ${scissors}</span><h3>${esc(translateProduct(p).name)}</h3><p>${esc(p.tagline || translateProduct(p).description)}</p>${route('detail', 'Explore this service ↗', 'pg-text-link', p.id)}</article>`).join('') : examples.map(([title, tagline, description, price], i) => `<article class="pg-service" data-reveal="fade-up"><span class="pg-number">0${i + 1} ${scissors}</span><h3>${esc(title)}</h3><p>${esc(tagline)}</p><p class="pg-small">${esc(description)}</p><div class="pg-service-bottom">${showcase ? `<span class="pg-price">from £${price}</span>` : ''}${route('contact', 'Ask about this service ↗', 'pg-text-link')}</div></article>`).join('')}</div>${showcase && !draft.products.length ? '<p class="pg-small pg-note">Illustrative services and prices · Confirm the salon’s actual offering before booking.</p>' : ''}`;
  const galleryItems = draft.products
    .flatMap((p) => [
      { url: asset(p.imageAssetId), alt: translateProduct(p).name },
      ...(p.gallery || []).map((g) => ({
        url: asset(g.assetId),
        alt: g.caption || translateProduct(p).name,
      })),
    ])
    .filter((p) => p.url)
    .slice(0, 5);
  const gallery = () =>
    `<section class="pg-section pg-gallery-section" id="gallery">${heading('The happy-dog edit', 'Fresh coats. Big personalities.', galleryItems.length ? 'A closer look at our services.' : 'A little inspiration for your next visit.')}<div class="pg-gallery" tabindex="0" aria-label="Dog photo gallery">${(galleryItems.length
      ? galleryItems
      : [
          { url: base + 'poodle.jpg', alt: 'French bulldog in a yellow jacket' },
          { url: base + 'hero.jpg', alt: 'Happy golden retriever outdoors' },
          { url: base + 'grooming.jpg', alt: 'Happy beagle outdoors' },
          { url: base + 'friends.jpg', alt: 'Playful chocolate labrador' },
          { url: base + 'care.jpg', alt: 'Black pug against a yellow background' },
        ]
    )
      .map((p) => `<figure>${photo(p.url, p.alt)}</figure>`)
      .join(
        '',
      )}</div>${galleryItems.length ? '' : '<p class="pg-small pg-note">Dog-care inspiration · Stock photography.</p>'}</section>`;
  const faq = () =>
    `<section class="pg-section pg-faq" id="faq"><div>${heading('Good to know', 'A few little questions.', 'Every dog is different. Tell us what makes yours unique.')}${route('contact', 'Have another question? ↗', 'pg-text-link')}</div><div>${FAQs.map(([q, a]) => `<details><summary>${esc(q)}<span aria-hidden="true">+</span></summary><p>${esc(a)}</p></details>`).join('')}</div></section>`;
  const process = () =>
    `<section class="pg-section">${heading('From hello to happy tails', 'Your visit, made simple.')}<div class="pg-three">${[
      [
        '01',
        'Tell us about your dog',
        'Share their breed, coat, temperament and what you have in mind.',
      ],
      [
        '02',
        'Plan the right visit',
        'The team will confirm the service, price and available appointment.',
      ],
      [
        '03',
        'Time for a fresh start',
        'Bring your dog along at the agreed time and discuss their care.',
      ],
    ]
      .map(
        ([n, t, d]) =>
          `<article class="pg-process"><span class="pg-step">${n}</span><h3>${t}</h3><p>${d}</p></article>`,
      )
      .join('')}</div></section>`;
  const breedGuide = () =>
    `<section class="pg-section pg-breeds">${heading('Every coat has a story', 'Find their kind of care.', 'Tell us about their coat and we’ll help you explore the options.')}<div class="pg-three">${[
      ['Short-coated', 'Labradors · Beagles · Boxers'],
      ['Long-coated', 'Cockers · Spaniels · Setters'],
      ['Curly-coated', 'Goldendoodles · Labradoodles · Cockapoos'],
    ]
      .map(([t, d]) => `<article>${paw}<h3>${t}</h3><p>${d}</p></article>`)
      .join('')}</div></section>`;
  const why = () =>
    `<section class="pg-section pg-why"><div class="pg-why-copy">${heading('Little things. Lots of love.', `A thoughtful approach to ${name === 'Pawfect Groom' ? 'grooming' : name}.`)}<ul>${(c.capabilities
      ? c.capabilities
          .split(/[\n;,；]/)
          .filter(Boolean)
          .slice(0, 4)
      : [
          'Start with a conversation',
          'Choose care for their coat',
          'Share what keeps them comfortable',
          'Plan the next visit together',
        ]
    )
      .map((t) => `<li><span aria-hidden="true">✓</span>${esc(t)}</li>`)
      .join(
        '',
      )}</ul>${route('about', 'Get to know us ↗', 'pg-text-link')}</div>${photo(asset(c.aboutImageAssetId) || base + 'salon-illustration.png', c.aboutImageAssetId ? 'Our salon' : 'Illustrative dog grooming in a salon')}</section>`;
  const demoPeople = () =>
    showcase
      ? `<section class="pg-section">${heading('People behind the pampering', 'Meet the groomers.', 'Illustrative team profiles — replace with your real team before publishing.')}<div class="pg-three">${[
          ['S', 'Sarah', 'Anxious dogs'],
          ['J', 'Jake', 'Long-coated breeds'],
          ['P', 'Priya', 'Doodles'],
        ]
          .map(
            ([initial, n, s]) =>
              `<article class="pg-person"><span class="pg-avatar">${initial}</span><h3>${n}</h3><span class="pg-chip">${s}</span><p>A friendly face for their next fresh start.</p></article>`,
          )
          .join(
            '',
          )}</div></section><section class="pg-section pg-quotes">${heading('The tail-wagging kind of happy', 'Kind words, happy dogs.', 'Example review layout — not verified customer reviews.')}<div class="pg-three">${['Our nervous dog finally felt at ease.', 'So much care in every little detail.', 'A fresh coat and a very happy pup.'].map((t) => `<blockquote><span aria-label="Sample five-star review">★★★★★</span><p>“${t}”</p><cite>Illustrative customer story</cite></blockquote>`).join('')}</div></section>`
      : '';
  let body = '';
  if (page === 'home')
    body = `<section class="pg-section pg-hero" data-wr-hero><div class="pg-hero-copy"><span class="pg-eyebrow">${scissors} A little care. A lot of happy.</span><h1>${copy?.headline || c.slogan ? esc(copy?.headline || c.slogan) : 'Your dog deserves<br>the <em>best groom.</em>'}</h1><p>${esc(copy?.subtitle || c.description || 'From a little tidy-up to a fresh new look. Make their next grooming day a good one.')}</p><div class="pg-actions">${button(copy?.cta || 'Book a groom')}${route('catalog', 'Explore services', 'pg-button pg-secondary')}</div><div class="pg-trust"><span>${paw} Coat care</span><span>${paw} Happy paws</span><span>${paw} Fresh starts</span></div></div><div class="pg-hero-art">${photo(base + 'hero.jpg', 'Happy golden retriever with a fluffy golden coat', 'pg-portrait', true)}<span class="pg-orbit">${paw}<span>Good hair.<br>Great dog.</span></span><span class="pg-photo-tag">Made for their happy place.</span></div></section><div class="pg-ribbon"><span>SMALL PAWS, BIG PERSONALITIES</span>${paw}<span>A FRESH START FROM NOSE TO TAIL</span>${paw}<span>A LITTLE EVERYDAY JOY</span></div><section class="pg-section" id="services">${heading('The grooming menu', 'What we offer.', 'A little refresh or the full works. Let’s find the right fit.')}${services()}</section>${why()}${gallery()}${breedGuide()}${demoPeople()}${faq()}`;
  if (page === 'catalog')
    body = `<section class="pg-section pg-page-heading" data-wr-hero><span class="pg-eyebrow">The grooming menu</span><h1>A little fresh.<br><em>A lot of feel-good.</em></h1><p>Explore the options, then tell us what your dog needs. The salon will confirm availability, pricing and care before your appointment.</p></section><section class="pg-section pg-tight">${services()}</section>${process()}${breedGuide()}${faq()}`;
  if (page === 'detail') {
    const p = draft.products.find((p) => p.id === options.productId);
    body = p
      ? `<section class="pg-section pg-detail"><div>${photo(image(p), translateProduct(p).name, '', true).replace('<img ', '<img id="wr-detail-main-img" ')}<div class="pg-detail-gallery senseng-detail-thumbs">${(
          [{assetId:p.imageAssetId,caption:translateProduct(p).name}, ...(p.gallery || [])]
        )
          .filter((g,i,all) => asset(g.assetId) && all.findIndex(other=>other.assetId===g.assetId)===i)
          .map((g) => `<button type="button" class="wr-detail-thumb" data-wr-material-thumb data-src="${esc(asset(g.assetId))}" aria-label="${esc(g.caption || translateProduct(p).name)}" aria-pressed="false" style="padding:0;border:0;background:transparent;cursor:pointer">${photo(asset(g.assetId), g.caption || translateProduct(p).name)}</button>`)
          .join(
            '',
          )}</div></div><div>${route('catalog', '← All services', 'pg-text-link')}<span class="pg-eyebrow">A little care, made personal</span><h1>${esc(translateProduct(p).name)}</h1><p>${esc(translateProduct(p).description)}</p>${p.tagline ? `<p class="pg-chip">${esc(p.tagline)}</p>` : ''}${p.sellingPoints?.length ? `<ul class="pg-checks">${p.sellingPoints.map((t) => `<li>✓ ${esc(t)}</li>`).join('')}</ul>` : ''}${p.material || p.dimensions ? `<dl>${p.material ? `<dt>${esc(ctx.ui.material)}</dt><dd>${esc(p.material)}</dd>` : ''}${p.dimensions ? `<dt>${esc(ctx.ui.dimensions)}</dt><dd>${esc(p.dimensions)}</dd>` : ''}</dl>` : ''}${route('contact', 'Enquire about this service ↗', 'pg-button', p.id)}<p class="pg-small">Your request is an enquiry. Appointment time and price are confirmed by the salon.</p></div></section>${process()}`
      : `<section class="pg-section pg-page-heading"><h1>Service not found</h1>${route('catalog', 'Explore our services ↗', 'pg-button')}</section>`;
  }
  if (page === 'about')
    body = `<section class="pg-section pg-page-heading" data-wr-hero><span class="pg-eyebrow">Hello from ${esc(name)}</span><h1>${esc(c.aboutHeadline || 'Big hearts. Little details.')}</h1><p>${esc(copy?.about || c.aboutStory || c.description || 'A good grooming experience begins with getting to know the dog in front of us.')}</p></section>${why()}<section class="pg-section pg-about-story"><div>${photo(asset(c.aboutSecondaryImageAssetId) || base + 'grooming.jpg', c.aboutSecondaryImageAssetId ? 'Our work' : 'Illustrative beagle portrait')}</div><div>${heading('Let’s get acquainted', 'Their personality comes first.')}<p>${esc(c.aboutHighlights || 'Tell us what they love, what worries them and how you like their coat. We’ll talk through the details before planning a visit.')}</p>${c.contactName ? `<p>Your contact: <strong>${esc(c.contactName)}</strong></p>` : ''}${c.certifications ? `<p>${esc(c.certifications)}</p>` : ''}${button('Say hello')}</div></section>${demoPeople()}${process()}${gallery()}`;
  if (page === 'contact')
    body = `<section class="pg-section pg-page-heading" data-wr-hero><span class="pg-eyebrow">Let’s make tails wag</span><h1>A fresh groom starts<br>with <em>a hello.</em></h1><p>Tell us a little about your dog and your preferred visit. We’ll get back to you to discuss the details. Sending a request does not confirm an appointment.</p></section><section class="pg-section pg-contact pg-tight"><aside><h2>Come say hello.</h2><p>${esc(name)}</p>${c.contactName ? `<p>${esc(c.contactName)}</p>` : ''}${c.email ? `<h3>Email us</h3><a href="mailto:${esc(c.email)}">${esc(c.email)}</a>` : ''}${c.phone ? `<h3>Call us</h3><a href="tel:${esc(c.phone.replace(/[^+\d]/g, ''))}">${esc(c.phone)}</a>` : ''}${c.address ? `<h3>Find us</h3><p>${esc(c.address)}</p>` : ''}<p class="pg-small">Please contact the salon to confirm opening hours and availability.</p>${photo(base + 'poodle.jpg', 'French bulldog in a yellow jacket')}</aside><div class="pg-form"><h2>Request an appointment</h2><p>Include your dog’s breed, coat, preferred dates and any special needs in your message.</p>${ctx.inquiryFormHtml.replace(`${esc(ctx.ui.product)} (`, 'Service (')}</div></section>${faq()}`;
  const logo = c.logoAssetId ? ctx.brandLogo : `${scissors}<span>${esc(name)}</span>`;
  const anchor = (id: string, label: string) =>
    page === 'home'
      ? `<a href="#${id}">${label}</a>`
      : `<a href="${path('index.html')}#${id}" ${navAttrs('home')}>${label}</a>`;
  return `<a class="pg-skip" href="#main">Skip to content</a><header class="pg-header"><a class="pg-brand" href="${path('index.html')}" ${navAttrs('home')}>${logo}</a><nav aria-label="Main navigation">${route('catalog', 'Services')}${route('about', 'About')}${anchor('gallery', 'Gallery')}${anchor('faq', 'FAQ')}</nav><div class="pg-header-right">${draft.languages.length > 1 ? `<div class="pg-languages">${ctx.languageLinks}</div>` : ''}${button('Book now')}</div></header><main id="main">${body}</main><section class="pg-booking"><div><span class="pg-eyebrow">A little pampering awaits</span><h2>Ready for their<br>next happy day?</h2><p>${c.address ? esc(c.address) : 'Let’s talk about your dog’s next fresh start.'}</p></div><div>${button('Request a groom')}${c.phone ? `<a class="pg-call" href="tel:${esc(c.phone.replace(/[^+\d]/g, ''))}">Call ${esc(c.phone)} ↗</a>` : ''}</div></section><footer class="pg-footer"><a class="pg-brand" href="${path('index.html')}" ${navAttrs('home')}>${logo}</a><div>${route('catalog', 'Services')}${route('about', 'About')}${route('contact', 'Contact')}${ctx.socials}</div><p>© ${new Date().getUTCFullYear()} ${esc(name)} · ${esc(ctx.ui.rights)}</p></footer>`;
}

export const pawfectStyles = `
@font-face {
  font-family: 'Plus Jakarta Sans';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url(/templates/pawfect-groom/jakarta-0.ttf) format('truetype');
}
@font-face {
  font-family: 'Plus Jakarta Sans';
  font-style: normal;
  font-weight: 500;
  font-display: swap;
  src: url(/templates/pawfect-groom/jakarta-1.ttf) format('truetype');
}
@font-face {
  font-family: 'Plus Jakarta Sans';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url(/templates/pawfect-groom/jakarta-2.ttf) format('truetype');
}
@font-face {
  font-family: 'Plus Jakarta Sans';
  font-style: normal;
  font-weight: 800;
  font-display: swap;
  src: url(/templates/pawfect-groom/jakarta-3.ttf) format('truetype');
}

*{box-sizing:border-box}html{scroll-behavior:smooth;scroll-padding-top:105px}body{margin:0;background:#faf8f3;color:#203337;font:400 15px/1.75 'Plus Jakarta Sans',system-ui,sans-serif}a{color:inherit;text-decoration:none}img{max-width:100%;display:block;object-fit:cover}button,input,select,textarea{font:inherit}svg{width:24px;height:24px;flex-shrink:0}h1,h2,h3,p{margin:0}h1,h2,h3{font-weight:800;line-height:1.13;letter-spacing:-.045em}h1{font-size:clamp(42px,5.8vw,82px)}h2{font-size:clamp(30px,3.4vw,46px)}h3{font-size:23px;letter-spacing:-.03em}p{color:#617071}em{font-style:normal;color:#327f85}a:focus-visible,summary:focus-visible,button:focus-visible,input:focus-visible,textarea:focus-visible,select:focus-visible,[tabindex]:focus-visible{outline:3px solid #c9833a;outline-offset:5px}.pg-section{max-width:1240px;margin:auto;padding:88px 40px}.pg-header{position:sticky;top:0;z-index:40;display:flex;align-items:center;gap:36px;justify-content:space-between;padding:22px max(32px,calc((100vw - 1160px)/2));background:#faf8f3ed;backdrop-filter:blur(8px);border-bottom:1px solid #38929a24}.pg-brand{display:flex;gap:10px;align-items:center;font-size:24px;font-weight:800;letter-spacing:-1px;line-height:1.1;max-width:310px;overflow-wrap:anywhere}.pg-brand svg{color:#38929a;width:29px;height:29px}.pg-brand img{max-width:180px;max-height:50px;object-fit:contain}.pg-header nav{display:flex;gap:27px;font-size:13px;font-weight:700}.pg-header nav a:hover,.pg-header nav a[aria-current]{color:#327f85}.pg-header-right{display:flex;align-items:center;gap:10px}.pg-languages{font-size:11px;display:flex;flex-wrap:wrap;gap:6px}.pg-button{background:var(--pg-primary,#327f85);color:var(--pg-ink,#fff);border:1px solid transparent;display:inline-flex;justify-content:center;align-items:center;padding:15px 23px;border-radius:100px;font-size:13px;font-weight:700;line-height:1.5;gap:10px;transition:transform .2s,background .2s}.pg-button:hover{transform:translateY(-3px);background:#245e63}.pg-secondary{background:transparent;color:#203337;border-color:#d5d8cc}.pg-secondary:hover{background:#edeae2}.pg-header .pg-button{padding:12px 20px;white-space:nowrap}.pg-eyebrow{display:flex;align-items:center;gap:10px;text-transform:uppercase;letter-spacing:.18em;font-size:10px;font-weight:800;color:#647674;margin-bottom:22px}.pg-eyebrow svg{width:18px;height:18px;color:#38929a}.pg-hero{display:grid;grid-template-columns:1.08fr 1fr;gap:40px;align-items:center;padding-top:65px;padding-bottom:85px;min-height:650px}.pg-hero-copy>p{margin:25px 0 30px;max-width:420px;font-size:16px}.pg-hero h1 em{position:relative}.pg-hero h1 em:after{content:'';position:absolute;left:0;right:0;bottom:-7px;height:5px;background:#c9833a;border-radius:100%;transform:rotate(-2deg)}.pg-actions{display:flex;gap:12px;flex-wrap:wrap}.pg-trust{display:flex;gap:20px;flex-wrap:wrap;font-size:10px;font-weight:700;margin-top:30px;color:#647674}.pg-trust span{display:flex;align-items:center;gap:6px}.pg-trust svg{width:15px;height:15px;color:#b37939}.pg-hero-art{position:relative;padding:10px 5px 30px}.pg-portrait{width:100%;height:490px;border-radius:40% 60% 70% 30% / 40% 50% 60% 50%;animation:pg-float 7s ease-in-out infinite;object-position:center 38%}.pg-orbit{position:absolute;right:-6px;top:5px;width:110px;height:110px;background:#f1d79f;border:6px solid #faf8f3;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;transform:rotate(12deg);font-weight:800;font-size:12px;line-height:1.25;text-align:center}.pg-photo-tag{position:absolute;bottom:28px;left:15px;background:#fff;padding:13px 20px;border-radius:30px;box-shadow:0 10px 30px #20333712;font-size:12px;font-weight:700}.pg-ribbon{background:#ecefe5;padding:20px 40px;display:flex;justify-content:center;align-items:center;gap:55px;font-size:10px;letter-spacing:.14em;font-weight:800;color:#61716b}.pg-ribbon svg{width:17px;height:17px;color:#b4894d}.pg-section-title{margin-bottom:35px;max-width:650px}.pg-section-title .pg-eyebrow{color:#aa6d2b;margin-bottom:15px}.pg-section-title p{margin-top:17px}.pg-services{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:22px}.pg-service{padding:28px;background:#f0eee6;border:1px solid #e3e1d7;border-top:3px solid #38929a;border-radius:9px;display:flex;flex-direction:column;align-items:flex-start;transition:border-color .25s,transform .25s}.pg-service:hover{border-color:#38929a;transform:translateY(-5px)}.pg-number{width:100%;display:flex;justify-content:space-between;align-items:center;color:#7c918b;font-size:12px;font-weight:700;margin-bottom:35px}.pg-number svg{color:#38929a}.pg-service h3{margin-bottom:14px}.pg-service p{font-size:13px;margin-bottom:16px}.pg-service-bottom{display:flex;align-items:center;gap:15px;flex-wrap:wrap;margin-top:auto}.pg-price{background:#edd8b4;color:#725018;padding:6px 11px;border-radius:30px;font-size:12px;font-weight:700}.pg-text-link{font-size:12px;font-weight:700;color:#327f85;display:inline-block;margin-top:15px}.pg-small{font-size:11px!important;line-height:1.7}.pg-note{margin-top:16px}.pg-why{display:grid;grid-template-columns:1fr 1fr;padding-top:30px;padding-bottom:30px;align-items:stretch}.pg-why-copy{padding:60px 45px;background:#2d7278;color:#faf8f3;border-radius:16px 0 0 16px}.pg-why .pg-eyebrow{color:#efd4a5}.pg-why .pg-text-link{color:#fff}.pg-why h2{font-size:36px}.pg-why ul{padding:0;margin:30px 0;list-style:none}.pg-why li{display:flex;gap:14px;margin-bottom:19px;font-size:14px}.pg-why li span{color:#f2d59e}.pg-why>img{width:100%;height:100%;min-height:450px;border-radius:0 16px 16px 0}.pg-gallery-section{padding-bottom:45px}.pg-gallery{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(0,1fr);gap:14px;overflow-x:auto}.pg-gallery figure{margin:0;overflow:hidden;border-radius:12px;height:270px;min-width:0}.pg-gallery figure:nth-child(even){margin-top:25px;height:245px}.pg-gallery img{width:100%;height:100%;transition:transform .4s}.pg-gallery img:hover{transform:scale(1.04)}.pg-three{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:25px}.pg-breeds{text-align:center}.pg-breeds .pg-section-title{margin:0 auto 36px}.pg-breeds .pg-eyebrow{justify-content:center}.pg-breeds article{padding:30px 20px;border:1px solid #dddfd5;border-radius:14px}.pg-breeds svg{color:#38929a;margin-bottom:15px;width:32px;height:32px}.pg-breeds h3{font-size:21px}.pg-breeds p{font-size:12px;margin-top:12px}.pg-person{text-align:center;background:#f0eee6;border-radius:14px;padding:35px 25px}.pg-avatar{display:flex;justify-content:center;align-items:center;margin:0 auto 20px;border-radius:50%;width:90px;height:90px;background:#d5e3db;color:#327f85;font-size:35px;font-weight:800}.pg-chip{display:inline-block;padding:5px 14px;border-radius:30px;background:#e5eadf;color:#3c655e;font-size:12px;margin:15px 0}.pg-person p{font-size:13px}.pg-quotes blockquote{margin:0;padding:25px;border:1px solid #e1dfd4;border-radius:14px}.pg-quotes blockquote span{color:#b27930;letter-spacing:4px}.pg-quotes blockquote p{font-weight:700;color:#203337;margin:20px 0}.pg-quotes cite{font-style:normal;font-size:10px;color:#617071}.pg-faq{display:grid;grid-template-columns:1fr 1.35fr;gap:65px}.pg-faq details{border-bottom:1px solid #d8dbd1;padding:20px 0}.pg-faq summary{display:flex;align-items:center;justify-content:space-between;gap:20px;list-style:none;cursor:pointer;font-weight:700;font-size:14px}.pg-faq summary::-webkit-details-marker{display:none}.pg-faq summary span{font-size:23px;color:#38929a;transition:transform .25s}.pg-faq details[open] summary span{transform:rotate(45deg)}.pg-faq details p{font-size:13px;padding:20px 30px 0 0}.pg-booking{background:#2d7278;color:#faf8f3;display:flex;justify-content:space-between;align-items:center;gap:40px;padding:65px max(40px,calc((100vw - 1160px)/2))}.pg-booking .pg-eyebrow{color:#e9d7b5}.pg-booking p{color:#d1e3e1;margin-top:20px}.pg-booking .pg-button{background:#faf8f3;color:#245e63}.pg-call{display:block;text-align:center;margin-top:18px;font-size:12px}.pg-footer{padding:40px max(40px,calc((100vw - 1160px)/2));display:flex;gap:30px;align-items:center;flex-wrap:wrap;background:#235d62;color:#fff}.pg-footer .pg-brand svg{color:#c7e1d9}.pg-footer>div{display:flex;gap:22px;flex-wrap:wrap;font-size:12px;margin-left:auto}.pg-footer>p{width:100%;color:#bad0cc;font-size:10px;border-top:1px solid #ffffff24;padding-top:22px}.pg-page-heading{max-width:900px;text-align:center;padding-top:75px;padding-bottom:60px}.pg-page-heading .pg-eyebrow{justify-content:center}.pg-page-heading h1{font-size:clamp(40px,5vw,67px)}.pg-page-heading p{margin:25px auto 0;max-width:620px}.pg-tight{padding-top:10px}.pg-process{border-top:1px solid #d8dbd1;padding-top:25px}.pg-step{color:#b17b37;font-weight:800;font-size:13px}.pg-process h3{margin:17px 0;font-size:21px}.pg-process p{font-size:13px}.pg-about-story,.pg-detail{display:grid;grid-template-columns:1fr 1fr;gap:65px;align-items:center}.pg-about-story>div>img,.pg-detail>div>img{border-radius:20px;width:100%;height:auto;max-height:570px;aspect-ratio:1;object-fit:cover}.pg-about-story p{margin-bottom:24px;white-space:pre-line}.pg-detail h1{font-size:46px;margin:22px 0}.pg-detail p{margin:18px 0;white-space:pre-line}.pg-detail .pg-eyebrow{margin:30px 0 10px}.pg-checks{list-style:none;padding:0}.pg-checks li{margin:10px 0}.pg-detail-gallery{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:15px}.pg-detail-gallery img{width:100%;height:auto;aspect-ratio:1;border-radius:8px}.pg-contact{display:grid;grid-template-columns:1fr 1.6fr;gap:65px;padding-bottom:40px}.pg-contact h2{font-size:29px;margin-bottom:22px}.pg-contact h3{font-size:14px;margin:25px 0 10px}.pg-contact aside>img{margin-top:30px;width:100%;height:240px;border-radius:15px}.pg-contact aside>p{margin-bottom:15px}.pg-contact a{overflow-wrap:anywhere}.pg-form{padding:36px;background:#fff;border:1px solid #e2e1d7;border-radius:18px}.pg-form>p{font-size:13px;margin-bottom:25px}.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px}.field{display:flex;flex-direction:column;gap:8px;font-size:12px;font-weight:700}.field.full,.form-status{grid-column:1/-1}input,select,textarea{width:100%;min-width:0;border:1px solid #d8dbd1;border-radius:8px;padding:11px;background:#fafbf7;color:#203337;font-size:14px}textarea{resize:vertical}.form-grid button{background:var(--pg-primary,#327f85);color:var(--pg-ink,#fff);border:0;padding:14px;border-radius:30px;font-weight:700;cursor:pointer}.form-grid button:disabled{opacity:.5;cursor:not-allowed}.honeypot{position:absolute;left:-10000px;width:1px;height:1px;overflow:hidden}.preview-bar{font-size:11px;text-align:center;background:#f0dfb6;padding:8px}.pg-skip{position:fixed;top:-100px;left:20px;background:white;padding:14px;z-index:100}.pg-skip:focus{top:10px}.wr-motion-ready [data-reveal]{opacity:0;transform:translateY(16px);transition:opacity .6s,transform .6s}.wr-motion-ready [data-reveal].wr-revealed{opacity:1;transform:none}@keyframes pg-float{50%{transform:translateY(-12px)}}
@media(min-width:1400px){.pg-hero{min-height:690px}}@media(max-width:950px){.pg-header{padding:18px 25px;gap:20px;flex-wrap:wrap}.pg-header nav{order:3;width:100%;justify-content:center;gap:30px}.pg-hero{gap:25px}.pg-portrait{height:400px}.pg-services{grid-template-columns:repeat(2,minmax(0,1fr))}.pg-ribbon{gap:20px}.pg-why-copy{padding:35px 25px}.pg-contact{gap:30px}.pg-gallery{grid-auto-columns:220px}.pg-brand{font-size:21px}.pg-faq{gap:35px}.pg-about-story,.pg-detail{gap:30px}}
@media(max-width:600px){.pg-section{padding:55px 22px}.pg-header{padding:15px 20px;gap:15px}.pg-header nav{gap:24px;font-size:12px}.pg-header .pg-button{font-size:11px;padding:10px 14px}.pg-brand{font-size:19px;max-width:180px}.pg-brand svg{width:22px;height:22px}.pg-hero{grid-template-columns:1fr;padding-top:42px;gap:40px}.pg-hero h1{font-size:49px}.pg-hero-art{max-width:450px;width:100%;margin:auto}.pg-portrait{height:380px}.pg-hero-copy>p{font-size:14px;margin:25px 0}.pg-orbit{width:90px;height:90px}.pg-trust{gap:15px}.pg-ribbon{padding:18px 22px;justify-content:center}.pg-ribbon span:not(:first-child),.pg-ribbon svg:last-child{display:none}.pg-services,.pg-three{grid-template-columns:1fr}.pg-service{padding:25px}.pg-number{margin-bottom:23px}.pg-why{grid-template-columns:1fr;padding-top:0;padding-bottom:0}.pg-why-copy{border-radius:16px 16px 0 0;padding:35px 25px}.pg-why>img{height:310px;min-height:0;border-radius:0 0 16px 16px}.pg-gallery{grid-auto-columns:200px;gap:12px}.pg-faq,.pg-about-story,.pg-contact,.pg-detail{grid-template-columns:1fr;gap:30px}.pg-booking{padding:45px 22px;flex-direction:column;align-items:flex-start;gap:30px}.pg-footer{padding:35px 22px;gap:25px}.pg-footer>div{margin-left:0;width:100%}.pg-form{padding:25px 20px}.form-grid{grid-template-columns:1fr}.pg-contact aside>img{display:none}.pg-page-heading{padding-bottom:40px}.pg-detail h1{font-size:38px}.pg-tight{padding-top:0}.pg-languages{max-width:75px}.pg-header-right{margin-left:auto}.pg-section-title{margin-bottom:28px}}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}*,*:before,*:after{animation:none!important;transition:none!important}.wr-motion-ready [data-reveal]{opacity:1;transform:none}}
`;
