import type { Product } from '../../shared/model';
import { isNativeToorunSource } from '../materials-typed';
import { esc, productPath, type ThemeContext } from './types';

const base = '/templates/toorun-early-learning/';
const demoProgramData = [
  ['Little Explorers', 'A playful introduction to routines, language and learning together.', 'Ages 2–3'],
  ['Creative Thinkers', 'Open-ended art, music and movement that encourages confident expression.', 'Ages 3–4'],
  ['Ready to Grow', 'Early literacy, numeracy and social activities for the next learning step.', 'Ages 4–5'],
  ['Outdoor Discoveries', 'Nature-led play that supports curiosity, movement and observation.', 'Mixed ages'],
  ['Story & Language', 'Conversation, stories and sound games that make language feel natural.', 'Mixed ages'],
  ['Family Workshops', 'Practical, welcoming sessions for children and their grown-ups.', 'Families'],
] as const;

export const toorunExamplePrograms = (): Product[] =>
  demoProgramData.map(([name, description, dimensions], index) => ({
    id: `program-${index + 1}`,
    name,
    description,
    material: 'Play-based guided learning',
    dimensions,
    tagline: index % 2 ? 'Learn, share and grow together.' : 'Curiosity starts here.',
    sellingPoints: ['Small-group activities', 'Age-aware learning goals', 'Family communication'],
    imageAssetId: `${base}learning-${(index % 5) + 1}.jpg`,
  }));

const faqItems = [
  ['How do I choose the right program?', 'Share your child’s age, interests and support needs. The team can explain the available program and help you decide whether it is a suitable fit.'],
  ['Can we visit before enrolling?', 'Use the contact form to ask about visits, introductions or current availability. The provider will confirm the options directly.'],
  ['What should my child bring?', 'Requirements vary by program. Ask the team for the current packing list, clothing guidance and any forms before the first session.'],
  ['How are families kept informed?', 'Communication arrangements differ by provider. Confirm how updates, progress conversations and urgent messages are handled when you enquire.'],
] as const;

export function renderToorunEarlyLearning(ctx: ThemeContext): string {
  const { draft, options, page, asset, path, navPath, navAttrs, translateProduct } = ctx;
  const company = draft.company;
  const copy = draft.copy[ctx.lang];
  const demo = ['preview', 'materials-demo', 'toorun-demo', 'inventory'].includes(options.projectId);
  const programs = draft.products.length ? draft.products : demo ? toorunExamplePrograms() : [];
  const name = company.name || 'Toorun';
  const route = (target: string, label: string, cls = '', productId?: string) => {
    const href =
      target === 'detail'
        ? productPath(productId)
        : target === 'contact' && productId
          ? `${navPath(target)}?productId=${encodeURIComponent(productId)}`
          : navPath(target);
    return `<a class="${cls}" href="${path(href)}" ${navAttrs(target, productId)}${page === target ? ' aria-current="page"' : ''}>${label}</a>`;
  };
  const button = (label: string, target = 'contact', secondary = false, productId?: string) =>
    route(target, `<span>${esc(label)}</span><span class="tr-button-arrow" aria-hidden="true">↗</span>`, `tr-button${secondary ? ' tr-button-secondary' : ''}`, productId);
  const picture = (src: string, alt: string, cls = '', eager = false, attrs = '') =>
    `<img class="${cls}" src="${esc(src)}" alt="${esc(alt)}" width="1200" height="1200" loading="${eager ? 'eager' : 'lazy'}" decoding="async"${eager ? ' fetchpriority="high"' : ''}${attrs ? ` ${attrs}` : ''}>`;
  const productImage = (product: Product | undefined, index = 0) =>
    asset(product?.imageAssetId) || `${base}learning-${(index % 5) + 1}.jpg`;
  const sectionHeading = (eyebrow: string, heading: string, text = '') =>
    `<div class="tr-section-heading" data-reveal="fade-up"><span class="tr-label">${esc(eyebrow)}</span><h2>${esc(heading)}</h2>${text ? `<p>${esc(text)}</p>` : ''}</div>`;
  const facts = (company.aboutHighlights || '')
    .split(/\r?\n/)
    .map((line) => line.split(/[|丨]/).map((item) => item.trim()))
    .filter((parts) => parts.some(Boolean))
    .slice(0, 3);

  const programCards = (items = programs) =>
    items.length
      ? `<div class="tr-program-grid" data-wr-product-list>${items
          .map((program, index) => {
            const translated = translateProduct(program);
            return `<article class="tr-program-card tr-card-${(index % 3) + 1}" data-reveal="fade-up" data-wr-product-card data-wr-product-id="${esc(program.id)}">
              <div class="tr-program-icon"><img src="${base}program-${(index % 6) + 1}.svg" alt="" width="88" height="88" loading="lazy"></div>
              <div class="tr-program-copy"><span class="tr-program-index">${String(index + 1).padStart(2, '0')}</span><h3>${esc(translated.name)}</h3><p>${esc(program.tagline || translated.description)}</p>${program.dimensions ? `<span class="tr-chip">${esc(program.dimensions)}</span>` : ''}</div>
              ${route('detail', '<span class="sr-only">View program details</span>↗', 'tr-card-link', program.id)}
            </article>`;
          })
          .join('')}</div>`
      : `<div class="tr-empty"><h3>Programs are being prepared.</h3><p>Contact the team for current services, age groups and availability.</p>${button('Ask about programs')}</div>`;

  const photoCollage = () => {
    const images = programs.slice(0, 5).map((program, index) => ({ src: productImage(program, index), alt: translateProduct(program).name }));
    const fallback = Array.from({ length: 5 }, (_, index) => ({ src: `${base}learning-${index + 1}.jpg`, alt: `Play-based learning activity ${index + 1}` }));
    return `<div class="tr-collage" aria-label="Learning moments">${(images.length >= 3 ? images : fallback)
      .slice(0, 5)
      .map((item, index) => `<figure class="tr-collage-${index + 1}">${picture(item.src, item.alt)}</figure>`)
      .join('')}</div>`;
  };

  const faq = () => `<section class="tr-section tr-faq"><div>${sectionHeading('Helpful answers', 'Frequently asked questions.', 'A few useful things to consider before you enquire.')}${button('Ask another question')}</div><div class="tr-faq-list">${faqItems.map(([question, answer], index) => `<details${index === 0 ? ' open' : ''}><summary>${esc(question)}<span aria-hidden="true">+</span></summary><p>${esc(answer)}</p></details>`).join('')}</div></section>`;

  const process = () => `<section class="tr-section tr-process"><div class="tr-process-head">${sectionHeading('A simple start', 'From first hello to the first day.', 'The exact process is confirmed by your provider.')}</div><div class="tr-process-grid">${[
    ['01', 'Tell us about your child', 'Share their age, interests and the support you are looking for.'],
    ['02', 'Explore the right program', 'Discuss current sessions, availability and practical arrangements.'],
    ['03', 'Plan the next step', 'The team confirms the agreed introduction, visit or enrolment process.'],
  ].map(([number, title, text]) => `<article><span>${number}</span><h3>${title}</h3><p>${text}</p></article>`).join('')}</div></section>`;

  const homeHeroImages = isNativeToorunSource(draft) && programs.length
    ? Array.from({ length: 4 }, (_, index) => {
      const program = programs[index % programs.length];
      return { src: productImage(program, index), alt: translateProduct(program).name };
    })
    : (programs.length >= 4
    ? programs.slice(0, 4).map((program, index) => ({ src: productImage(program, index), alt: translateProduct(program).name }))
    : Array.from({ length: 4 }, (_, index) => ({ src: `${base}hero-child-${index + 1}.jpg`, alt: `Child enjoying a learning activity ${index + 1}` })));
  const homeHero = `<section class="tr-hero" data-wr-hero data-wr-collection-hero>
    <div class="tr-hero-content"><span class="tr-label">PLAY · LEARN · GROW</span><h1>${esc(copy?.headline || company.slogan || 'Building Strong Foundations For Lifelong Learning')}</h1><p>${esc(copy?.subtitle || company.description || 'Thoughtful early learning experiences that help children build confidence, curiosity and everyday skills.')}</p>${button(copy?.cta || 'Get started')}</div>
    <div class="tr-hero-portraits">${homeHeroImages.map((item, index) => `<figure class="tr-portrait tr-portrait-${index + 1}">${picture(item.src, item.alt, 'tr-hero-image', true)}</figure>`).join('')}</div>
  </section>`;

  let content = '';
  if (page === 'home') {
    content = `${homeHero}
      <section class="tr-section tr-intro"><div>${sectionHeading('Welcome to our learning community', 'Carefully designed for growing minds.')}</div><div><p class="tr-lead">${esc(company.aboutHeadline || company.description || 'Play-based activities, caring guidance and meaningful interaction help children feel safe enough to explore, connect and grow.')}</p>${route('about', 'Discover our approach ↗', 'tr-text-link')}</div></section>
      <section class="tr-section tr-values"><article><span>01</span><h3>Child-first care</h3><p>Start with each child’s pace, personality and needs.</p></article><article><span>02</span><h3>Learning through play</h3><p>Turn curiosity and movement into meaningful discovery.</p></article><article><span>03</span><h3>Connected families</h3><p>Keep practical communication clear and welcoming.</p></article></section>
      <section class="tr-photo-section"><div class="tr-photo-copy">${sectionHeading('Why families choose us', 'Designed for children’s early education.', 'A warm environment for play, connection and growing independence.')}<ul><li>Age-aware activities</li><li>Thoughtful daily rhythms</li><li>Space for curiosity</li><li>Family communication</li></ul>${button('Meet our approach', 'about')}</div>${photoCollage()}</section>
      <section class="tr-section tr-programs">${sectionHeading('Learning programs', 'A program for every new discovery.', 'Explore the current services and ask the team which option may suit your child.')}${programCards()}</section>
      ${process()}${faq()}`;
  }

  if (page === 'catalog') {
    content = `<section class="tr-page-hero"><span class="tr-label">OUR PROGRAMS</span><h1>Learning shaped around curiosity and care.</h1><p>Compare the available programs, then speak with the team about age groups, schedules and next steps.</p></section><section class="tr-section tr-programs tr-programs-page">${programCards()}</section>${process()}${faq()}`;
  }

  if (page === 'detail') {
    const program = programs.find((item) => item.id === options.productId);
    if (program) {
      const translated = translateProduct(program);
      content = `<section class="tr-section tr-detail"><div class="tr-detail-media">${picture(productImage(program), translated.name, 'tr-detail-image', true, 'id="wr-detail-main-img" data-wr-product-image')}${program.gallery?.length ? `<div class="tr-detail-gallery product-gallery">${program.gallery.slice(0, 3).map((item) => picture(asset(item.assetId), item.caption || translated.name)).join('')}</div>` : ''}</div><div class="tr-detail-copy">${route('catalog', '← All programs', 'tr-text-link')}<span class="tr-label">PROGRAM DETAILS</span><h1>${esc(translated.name)}</h1>${program.tagline ? `<p class="tr-lead">${esc(program.tagline)}</p>` : ''}<p>${esc(translated.description)}</p>${program.sellingPoints?.length ? `<ul class="tr-check-list">${program.sellingPoints.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>` : ''}<dl>${program.material ? `<div><dt>Approach</dt><dd>${esc(program.material)}</dd></div>` : ''}${program.dimensions ? `<div><dt>Age group / format</dt><dd>${esc(program.dimensions)}</dd></div>` : ''}</dl>${button('Ask about this program', 'contact', false, program.id)}<p class="tr-small">Your request is an enquiry. Availability, schedule, fees and enrolment are confirmed directly by the provider.</p></div></section>${process()}${faq()}`;
    } else {
      content = `<section class="tr-page-hero"><h1>Program not found.</h1><p>Return to the program list to explore the current options.</p>${button('View all programs', 'catalog')}</section>`;
    }
  }

  if (page === 'about') {
    const aboutImage = asset(company.aboutImageAssetId) || `${base}learning-2.jpg`;
    const story = company.aboutStory || company.description || 'We believe early learning works best when children feel secure, seen and free to explore. Our approach brings together purposeful play, caring relationships and clear family communication.';
    content = `<section class="tr-page-hero tr-about-title"><span class="tr-label">WELCOME TO ${esc(name.toUpperCase())}</span><h1>${esc(company.aboutHeadline || 'Dedicated to nurturing young minds through care.')}</h1></section><section class="tr-section tr-about-lead"><div class="tr-about-image">${picture(aboutImage, `${name} learning environment`, 'tr-about-main', true)}</div><div><span class="tr-label">OUR STORY</span><h2>A thoughtful place to learn, play and belong.</h2>${story.split(/\r?\n/).filter(Boolean).map((paragraph) => `<p>${esc(paragraph)}</p>`).join('')}${facts.length ? `<div class="tr-facts">${facts.map(([value, label, description]) => `<div><strong>${esc(value || '✓')}</strong><span>${esc(label || description || '')}</span></div>`).join('')}</div>` : ''}</div></section><section class="tr-section tr-values"><article><span>01</span><h3>Safe to explore</h3><p>Support confidence with consistent routines and attentive care.</p></article><article><span>02</span><h3>Free to imagine</h3><p>Make room for questions, creativity and self-expression.</p></article><article><span>03</span><h3>Ready to connect</h3><p>Build social skills through conversation and shared experiences.</p></article></section><section class="tr-photo-section tr-about-collage"><div class="tr-photo-copy">${sectionHeading('Our approach', 'Small moments can build lifelong foundations.', 'Every activity should have a clear purpose while still feeling joyful and natural.')}${button('Explore programs', 'catalog')}</div>${photoCollage()}</section>${faq()}`;
  }

  if (page === 'contact') {
    const phone = company.phone ? `<a href="tel:${esc(company.phone)}">${esc(company.phone)}</a>` : '';
    const address = company.address ? `<p>${esc(company.address)}</p>` : '';
    content = `<section class="tr-page-hero"><span class="tr-label">LET’S TALK</span><h1>Start with a simple hello.</h1><p>Tell the team what you are looking for. They will confirm the available programs, practical details and next step.</p></section><section class="tr-section tr-contact"><aside><span class="tr-label">CONTACT DETAILS</span><h2>We’re here to help you explore the options.</h2><a href="mailto:${esc(company.email)}">${esc(company.email)}</a>${phone}${address}<p class="tr-small">Sending this form creates an enquiry. It does not complete an enrolment or booking.</p></aside><div class="tr-form-wrap">${ctx.inquiryFormHtml}</div></section>`;
  }

  const header = `<header class="tr-header"><div class="tr-nav"><a class="tr-brand" href="${path('index.html')}" ${navAttrs('home')} aria-label="${esc(name)} home"><span class="tr-brand-mark"><i></i><i></i><i></i></span><strong>${esc(name)}</strong></a><details class="tr-menu"><summary aria-label="Open navigation"><span></span><span></span><span></span></summary><nav>${route('home', 'Home')}${route('about', 'About')}${route('catalog', 'Programs')}${route('contact', 'Contact')}${ctx.languageLinks ? `<div class="tr-languages">${ctx.languageLinks}</div>` : ''}</nav></details><nav class="tr-desktop-nav">${route('home', 'Home')}${route('about', 'About')}${route('catalog', 'Programs')}${route('contact', 'Contact')}</nav>${button('Contact us')}</div></header>`;
  const footer = `<footer class="tr-footer"><div class="tr-footer-cloud"><div><a class="tr-brand tr-footer-brand" href="${path('index.html')}" ${navAttrs('home')}><span class="tr-brand-mark"><i></i><i></i><i></i></span><strong>${esc(name)}</strong></a><h2>Growing curious minds, one day at a time.</h2>${button('Start a conversation')}</div></div><div class="tr-footer-bottom"><div><strong>${esc(name)}</strong><p>${esc(company.description || 'A welcoming early learning community for children and families.')}</p></div><nav>${route('about', 'About')}${route('catalog', 'Programs')}${route('contact', 'Contact')}</nav><div>${company.email ? `<a href="mailto:${esc(company.email)}">${esc(company.email)}</a>` : ''}${ctx.socials ? `<div class="tr-socials">${ctx.socials}</div>` : ''}</div></div><div class="tr-legal"><span>© ${new Date().getFullYear()} ${esc(name)}. ${esc(ctx.ui.rights)}</span><span>Enquiries are confirmed directly by the provider.</span></div></footer>`;
  return `${header}<main>${content}</main>${footer}`;
}
