import type { Draft, Product } from '../../shared/model';
import { displayProducts } from '../../shared/product-display';
import { materialsRuntime } from '../../shared/materials-runtime';
import { buildThemeContext, esc, productPath, safeUrl, type RenderOptions } from './types';
import { auravellExampleClasses, auravellImages, auravellTexts } from './auravell/inventory';
import { auravellFixes } from './auravell/styles';
import { auravellRuntime } from './auravell/runtime';

export { auravellRuntime, auravellExampleClasses };

const validColor = (v?: string) => (v && /^#[0-9a-f]{6}$/i.test(v) ? v : undefined);

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function renderAuravellSite(input: Draft, options: RenderOptions): string {
  const validPages = ['home', 'catalog', 'about', 'plans', 'contact', 'detail'];
  const requestedPage = options.page === 'extra-plans' ? 'plans' : options.page;
  const page = validPages.includes(requestedPage) ? requestedPage : 'home';
  const demo = ['preview', 'materials-demo', 'auravell-demo'].includes(options.projectId);

  const text = (id: string) =>
    input.materials?.textBindings.find((b) => b.slotId === id && b.locale === options.lang)?.text;

  const draft: Draft = {
    ...input,
    products: input.products.map((p) => {
      const main = input.materials?.imageBindings.find(
        (b) => b.slotId === 'product-main' && b.productId === p.id,
      );
      const gallery = input.materials?.imageBindings
        .filter((b) => b.slotId === 'product-gallery' && b.productId === p.id)
        .sort((a, b) => (a.itemIndex ?? 0) - (b.itemIndex ?? 0));
      return {
        ...p,
        imageAssetId: main?.assetId || p.imageAssetId,
        ...(gallery?.length
          ? {
              gallery: gallery.map((b) => ({
                assetId: b.assetId,
                sourceImageId: b.assetId,
                kind: 'original' as const,
                caption: b.alt[options.lang] || p.name,
              })),
            }
          : {}),
      };
    }),
  };

  if (demo && !draft.products.length) {
    draft.products = auravellExampleClasses.map((c) => ({ ...c }));
  }

  const ctx = buildThemeContext(draft, options);
  const products = displayProducts(draft);
  const selected = draft.products.find((p) => p.id === options.productId) || ctx.mainProduct;

  const name = draft.company.name || (demo ? 'Auravell' : 'Auravell Yoga Sanctuary');
  const copy = draft.copy[options.lang] || draft.copy.en;
  const image = (id: string) => {
    const binding = draft.materials?.imageBindings.find(b => b.slotId === id && !b.productId);
    return ctx.asset(binding?.assetId) || auravellImages.find(i => i.id === id)?.defaultAsset || '';
  };
  const brandAccent = validColor(draft.brandColor) || '#99582a';

  const depth = options.page === 'home' ? '' : options.page === 'detail' ? '../../' : '../';
  const path = (p: string) =>
    depth + (p === 'home' ? 'index.html' : p === 'detail' ? productPath(selected?.id) : `${p === 'plans' ? 'extra-plans' : p}/index.html`);

  const title =
    text(`${page === 'detail' ? 'productDetail' : page}-seo-title`) ||
    (page === 'home'
      ? `${name} · Mindful Yoga & Wellness Sanctuary`
      : page === 'detail' && selected
        ? `${ctx.translateProduct(selected).name} · ${name}`
        : `${page[0].toUpperCase() + page.slice(1)} · ${name}`);

  const description =
    text(`${page === 'detail' ? 'productDetail' : page}-seo-description`) ||
    copy?.subtitle ||
    draft.company.description ||
    'Find balance, strength, and calm through mindful yoga and meditation classes designed for your well-being.';

  const logo = ctx.asset(draft.company.logoAssetId);
  const brandElement = logo
    ? `<img src="${esc(logo)}" alt="${esc(name)}" style="max-height:38px;object-fit:contain;">`
    : `<span style="font-family:'Playfair Display',Georgia,serif;font-size:26px;font-weight:600;letter-spacing:-0.5px;color:#2a2b2f;">${esc(name)}</span>`;

  // Navigation Bar
  const navHtml = `
    <div class="rt-nav-section-v1">
      <div data-animation="default" data-collapse="medium" data-duration="400" role="banner" class="rt-navbar w-nav">
        <div class="rt-position-relative rt-full-width">
          <div class="rt-container rt-responsive-change w-container">
            <div class="w-layout-hflex rt-nav-wrapper">
              <a href="${esc(path('home'))}" aria-current="${page === 'home' ? 'page' : 'false'}" class="rt-navbar-brand w-nav-brand ${page === 'home' ? 'w--current' : ''}" data-wr-page="home">
                ${brandElement}
              </a>
              <nav role="navigation" class="rt-navbar-menu-wrapper w-nav-menu" data-auravell-nav>
                <div class="w-layout-hflex rt-navbar-inner-wrap">
                  <div class="w-layout-hflex rt-navbar-dropdown-toggle">
                    <div class="w-layout-vflex"><a href="${esc(path('home'))}" class="rt-nav-link ${page === 'home' ? 'w--current' : ''}" data-wr-page="home">Home</a></div>
                  </div>
                  <div class="w-layout-hflex rt-navbar-dropdown-toggle">
                    <div class="w-layout-vflex"><a href="${esc(path('about'))}" class="rt-nav-link ${page === 'about' ? 'w--current' : ''}" data-wr-page="about">About</a></div>
                  </div>
                  <div class="w-layout-hflex rt-navbar-dropdown-toggle">
                    <div class="w-layout-vflex"><a href="${esc(path('catalog'))}" class="rt-nav-link ${page === 'catalog' ? 'w--current' : ''}" data-wr-page="catalog">Classes</a></div>
                  </div>
                  <div class="w-layout-hflex rt-navbar-dropdown-toggle">
                    <div class="w-layout-vflex"><a href="${esc(path('plans'))}" class="rt-nav-link ${page === 'plans' ? 'w--current' : ''}" data-wr-page="extra-plans">Plans</a></div>
                  </div>
                  <div class="w-layout-hflex rt-navbar-dropdown-toggle">
                    <div class="w-layout-vflex"><a href="${esc(path('contact'))}" class="rt-nav-link ${page === 'contact' ? 'w--current' : ''}" data-wr-page="contact">Contact</a></div>
                  </div>
                </div>
              </nav>
              <div class="w-layout-hflex rt-tab-none">
                <a href="${esc(path('contact'))}" class="rt-button-v1 rt-radius-2xs rt-overflow-hidden w-inline-block" data-wr-page="contact" style="background-color:${brandAccent};color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:30px;font-size:14px;font-weight:500;">
                  <span>${esc(text('primary-cta') || copy?.cta || 'Book a Class')}</span>
                </a>
              </div>
              <div class="rt-menu-button-main w-nav-button" data-auravell-menu data-wr-mobile-menu role="button" tabindex="0" aria-expanded="false" aria-label="Open menu">
                <div class="rt-menu-line"></div>
                <div class="rt-menu-line rt-middle-line"></div>
                <div class="rt-menu-line rt-bottom-line"></div>
              </div>
            </div>
          </div>
          <div class="rt-navbar-overlay" style="display:none;"></div>
        </div>
      </div>
    </div>
  `;

  // Footer Component
  const footerHtml = `
    <footer class="rt-footer" data-wr-footer style="background-image:linear-gradient(#17181ae8,#17181ae8),url('${esc(image('footer-background'))}');background-size:cover;background-color:#17181a;position:relative;overflow:hidden;margin-top:60px;padding:80px 0 40px;color:#ffffff;">
      <div class="w-layout-blockcontainer rt-container rt-position-relative w-container" style="position:relative;z-index:2;">
        <div class="rt-footer-wrap-v1">
          <div class="rt-footer-text-wrapper rt-text-center" style="text-align:center;margin-bottom:60px;">
            <h2 class="rt-text-color-quaternary" style="color:#ffffff;font-size:42px;margin-bottom:20px;font-family:'Playfair Display',Georgia,serif;">
              Your journey to a calmer mind starts today
            </h2>
            <div style="display:flex;justify-content:center;">
              <a href="${esc(path('contact'))}" class="rt-button-v1 rt-radius-2xs w-inline-block" data-wr-page="contact" style="background-color:#ffffff;color:#17181a;text-decoration:none;padding:14px 32px;border-radius:30px;font-size:15px;font-weight:600;">
                ${esc(text('primary-cta') || copy?.cta || 'Begin your journey')}
              </a>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1.5fr 1fr 1fr;gap:48px;padding-top:40px;border-top:1px solid rgba(255,255,255,0.12);">
            <div>
              <div style="margin-bottom:16px;">
                <span style="font-family:'Playfair Display',Georgia,serif;font-size:24px;font-weight:600;color:#ffffff;">${esc(name)}</span>
              </div>
              <p style="color:rgba(255,255,255,0.7);font-size:14px;line-height:1.6;max-width:320px;">
                ${esc(draft.company.description || 'A serene wellness sanctuary dedicated to yoga, breathwork, and mindful holistic healing.')}
              </p>
              ${draft.languages.length > 1 ? `<div style="margin-top:20px;">${ctx.languageLinks}</div>` : ''}
            </div>
            <div>
              <h4 style="color:#ffffff;font-size:16px;margin:0 0 16px;text-transform:uppercase;letter-spacing:1px;">Navigation</h4>
              <ul style="list-style:none;padding:0;margin:0;line-height:2.2;font-size:14px;">
                <li><a href="${esc(path('home'))}" style="color:rgba(255,255,255,0.7);text-decoration:none;" data-wr-page="home">Home</a></li>
                <li><a href="${esc(path('about'))}" style="color:rgba(255,255,255,0.7);text-decoration:none;" data-wr-page="about">About us</a></li>
                <li><a href="${esc(path('catalog'))}" style="color:rgba(255,255,255,0.7);text-decoration:none;" data-wr-page="catalog">Our classes</a></li>
                <li><a href="${esc(path('plans'))}" style="color:rgba(255,255,255,0.7);text-decoration:none;" data-wr-page="extra-plans">Plans & passes</a></li>
                <li><a href="${esc(path('contact'))}" style="color:rgba(255,255,255,0.7);text-decoration:none;" data-wr-page="contact">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 style="color:#ffffff;font-size:16px;margin:0 0 16px;text-transform:uppercase;letter-spacing:1px;">Location & Hours</h4>
              <p style="color:rgba(255,255,255,0.7);font-size:14px;line-height:1.6;margin-bottom:12px;">
                ${esc(draft.company.address || (demo ? '410 Sandtown, California 94001, USA' : ''))}
              </p>
              <p style="color:rgba(255,255,255,0.7);font-size:14px;line-height:1.6;margin-bottom:8px;">
                Email: <a href="mailto:${esc(draft.company.email || (demo ? 'info@auravell.com' : ''))}" style="color:#ffffff;text-decoration:none;">${esc(draft.company.email || (demo ? 'info@auravell.com' : ''))}</a>
              </p>
              <p style="color:rgba(255,255,255,0.7);font-size:14px;line-height:1.6;">
                Phone: <a href="tel:${esc(draft.company.phone || (demo ? '(888) 456 7890' : ''))}" style="color:#ffffff;text-decoration:none;">${esc(draft.company.phone || (demo ? '(888) 456 7890' : ''))}</a>
              </p>
            </div>
          </div>
          <div style="border-top:1px solid rgba(255,255,255,0.08);margin-top:40px;padding-top:20px;text-align:center;font-size:13px;color:rgba(255,255,255,0.5);">
            © ${new Date().getFullYear()} ${esc(name)}. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  `;

  // Inquiry form markup
  const formHtml = `
    <form class="auravell-inquiry-box" data-auravell-form data-wr-preview-disabled="${!!options.preview || demo}" method="POST" action="${esc(safeUrl(options.inquiryUrl) || '#')}">
      <h3 style="font-size:22px;margin:0 0 12px;font-family:'Playfair Display',Georgia,serif;color:#2a2b2f;">Reserve a Session</h3>
      <p style="font-size:14px;color:#666;margin:0 0 20px;">Send us an inquiry and our team will get in touch with you shortly.</p>
      <div>
        <label style="display:block;font-size:13px;font-weight:600;margin-bottom:6px;color:#444;">Your Name *</label>
        <input type="text" name="name" maxlength="120" required placeholder="Jane Doe" />
      </div>
      <div>
        <label style="display:block;font-size:13px;font-weight:600;margin-bottom:6px;color:#444;">Email Address *</label>
        <input type="email" name="email" maxlength="254" required placeholder="jane@example.com" />
      </div>
      <div>
        <label style="display:block;font-size:13px;font-weight:600;margin-bottom:6px;color:#444;">Select Class / Experience</label>
        <select name="productId">
          <option value="">— Please choose a class —</option>
          ${products.map((p) => `<option value="${esc(p.id)}"${selected?.id === p.id ? ' selected' : ''}>${esc(ctx.translateProduct(p).name)}</option>`).join('')}
        </select>
      </div>
      <div>
        <label style="display:block;font-size:13px;font-weight:600;margin-bottom:6px;color:#444;">Your Message or Preferred Time</label>
        <textarea name="message" required maxlength="5000" rows="3" placeholder="Tell us about your practice experience or schedule preferences..."></textarea>
      </div>
      <button type="submit"${options.preview || demo ? ' disabled' : ''} style="background-color:${brandAccent};">Submit Booking Request</button>
      <div role="status" aria-live="polite" class="auravell-form-status" style="margin-top:16px;padding:12px;background:#eef7ee;border-radius:8px;color:#2d6a4f;font-size:14px;text-align:center;"></div>
    </form>
  `;

  // Render cards for classes
  const renderClassCards = (items: Product[]) => `
    <div class="auravell-class-grid" data-wr-product-list="${esc(page)}">
      ${items
        .map((p) => {
          const trans = ctx.translateProduct(p);
          const photo = ctx.asset(p.imageAssetId) || '/templates/auravell/images/6a7d651d45031f173673109f_f686c4255802fa9f938b7bf22f73da0f_yoga-site-image-one.avif';
          return `
            <article class="auravell-class-card" data-product-card data-wr-product-card data-wr-product-id="${esc(p.id)}" data-product-name="${esc(trans.name)}" data-auravell-category="${p.material?.toLowerCase().includes('meditation') ? 'meditation' : p.material?.toLowerCase().includes('vinyasa') ? 'yoga' : 'all'}">
              <a href="${esc(depth + productPath(p.id))}" data-wr-page="detail" data-wr-product-id="${esc(p.id)}">
                <img src="${esc(photo)}" alt="${esc(trans.name)}" loading="lazy" data-wr-material-image="product-main" data-wr-material-product="${esc(p.id)}">
              </a>
              <div class="auravell-class-card-body">
                <h3><a href="${esc(depth + productPath(p.id))}" style="color:#2a2b2f;text-decoration:none;" data-wr-page="detail" data-wr-product-id="${esc(p.id)}">${esc(trans.name)}</a></h3>
                <p>${esc(p.tagline || trans.description)}</p>
                <div class="auravell-class-card-meta">
                  <span>${esc(p.material || 'All levels')}</span>
                  <span>${esc(p.dimensions || 'Weekly sessions')}</span>
                </div>
              </div>
            </article>
          `;
        })
        .join('')}
    </div>
  `;

  // Page Specific Content
  let mainContent = '';

  if (page === 'home') {
    const heroImage = esc(image('home-hero'));
    const heroHeadline = text('hero-headline') || copy?.headline || 'Quiet the noise inside your mind';
    const heroSubtitle =
      text('hero-subtitle') ||
      copy?.subtitle ||
      'Discover the transformative power of guided meditation, breathwork, and holistic healing — whether you’re a beginner or an advanced practitioner.';

    mainContent = `
      <section class="rt-hero">
        <div class="rt-hero-v1-content">
          <div class="w-layout-blockcontainer rt-container w-container">
            <div class="w-layout-hflex rt-horizontal rt-full-width rt-hero-content">
              <div class="w-layout-vflex rt-vertical rt-hero-v1-left-content" style="max-width:620px;">
                <div class="rt-text-color-quaternary rt-subtext" style="color:#ffffff;font-size:14px;letter-spacing:2px;text-transform:uppercase;margin-bottom:12px;">Live well, feel better</div>
                <h1 class="rt-text-color-quaternary" style="color:#ffffff;font-size:58px;line-height:1.15;margin-bottom:20px;">
                  ${esc(heroHeadline).replace(/(inside|quiet|mind|flow)/gi, '<span class="rt-italic-text" style="color:#ffffff;">$1</span>')}
                </h1>
                <p class="rt-text-color-quaternary rt-col-v5" style="color:rgba(255,255,255,0.85);font-size:18px;line-height:1.6;margin-bottom:32px;">
                  ${esc(heroSubtitle)}
                </p>
                <div>
                  <a href="${esc(path('contact'))}" class="rt-button-v1 rt-radius-2xs w-inline-block" data-wr-page="contact" style="background-color:${brandAccent};color:#ffffff;padding:16px 36px;border-radius:30px;font-size:16px;text-decoration:none;font-weight:500;">
                    ${esc(text('primary-cta') || copy?.cta || 'Book a Class')}
                  </a>
                </div>
              </div>
              <div class="w-layout-vflex rt-hero-card-v1" style="background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 12px 40px rgba(0,0,0,0.15);width:340px;">
                <div style="position:relative;height:200px;overflow:hidden;">
                  <img data-wr-material-image="wellness-meditation" src="${esc(image('wellness-meditation'))}" alt="Morning Stillness" style="width:100%;height:100%;object-fit:cover;">
                </div>
                <div style="padding:20px;">
                  <div style="font-size:12px;color:#99582a;font-weight:600;margin-bottom:4px;text-transform:uppercase;">Monday & Thursday</div>
                  <div style="font-family:'Playfair Display',Georgia,serif;font-size:20px;font-weight:600;margin-bottom:12px;color:#2a2b2f;">Morning Stillness</div>
                  <div style="display:flex;gap:16px;font-size:13px;color:#666;">
                    <span>⏱ 45 min</span>
                    <span>🌿 In studio</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="rt-hero-image-wrap">
          <img class="rt-hero-image" data-wr-material-image="home-hero" src="${heroImage}" alt="Auravell Sanctuary" hero-image="">
          <div class="rt-hero-gradient-v1"></div>
        </div>
      </section>

      <!-- Wellness Programs Feature Cards -->
      <section class="rt-section-top" style="padding:80px 0;">
        <div class="w-layout-blockcontainer rt-container w-container">
          <div style="text-align:center;max-width:680px;margin:0 auto 48px;">
            <div style="font-size:13px;letter-spacing:2px;text-transform:uppercase;color:#99582a;margin-bottom:8px;font-weight:600;">Explore Wellness Programs</div>
            <h2 style="font-size:40px;font-family:'Playfair Display',Georgia,serif;margin:0 0 16px;">
              Find a <span class="rt-italic-text" style="color:#99582a;">session</span> that calls to you
            </h2>
          </div>
          <div style="display:grid;grid-template-columns:repeat(3, minmax(0, 1fr));gap:32px;">
            <div style="background:#ffffff;border-radius:20px;padding:36px;border:1px solid #ebdccb;text-align:center;">
              <div style="width:64px;height:64px;margin:0 auto 20px;background:#f5ede1;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:28px;color:#99582a;">✦</div>
              <img data-wr-material-image="wellness-meditation" src="${esc(image('wellness-meditation'))}" alt="Mindfulness & Meditation" style="width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:16px;margin-bottom:20px;" loading="lazy"><h3 style="font-size:22px;margin:0 0 12px;font-family:'Playfair Display',Georgia,serif;">Mindfulness & Meditation</h3>
              <p style="font-size:15px;line-height:1.6;color:#555;">Find deep stillness, regulate your nervous system, and restore clarity through guided seated practices.</p>
            </div>
            <div style="background:#ffffff;border-radius:20px;padding:36px;border:1px solid #ebdccb;text-align:center;">
              <div style="width:64px;height:64px;margin:0 auto 20px;background:#f5ede1;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:28px;color:#99582a;">◈</div>
              <img data-wr-material-image="wellness-yoga" src="${esc(image('wellness-yoga'))}" alt="Vinyasa & Yin Flow" style="width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:16px;margin-bottom:20px;" loading="lazy"><h3 style="font-size:22px;margin:0 0 12px;font-family:'Playfair Display',Georgia,serif;">Vinyasa & Yin Flow</h3>
              <p style="font-size:15px;line-height:1.6;color:#555;">Connect fluid movement with natural breath cycles to gently build functional mobility and release chronic tension.</p>
            </div>
            <div style="background:#ffffff;border-radius:20px;padding:36px;border:1px solid #ebdccb;text-align:center;">
              <div style="width:64px;height:64px;margin:0 auto 20px;background:#f5ede1;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:28px;color:#99582a;">✺</div>
              <img data-wr-material-image="wellness-breathwork" src="${esc(image('wellness-breathwork'))}" alt="Sound Bath & Breathwork" style="width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:16px;margin-bottom:20px;" loading="lazy"><h3 style="font-size:22px;margin:0 0 12px;font-family:'Playfair Display',Georgia,serif;">Sound Bath & Breathwork</h3>
              <p style="font-size:15px;line-height:1.6;color:#555;">Immerse yourself in acoustic vibrations of artisan Tibetan singing bowls paired with nervous-system balancing breath.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Why Choose Us & Space Gallery -->
      <section style="background:#f5ede1;padding:80px 0;">
        <div class="w-layout-blockcontainer rt-container w-container">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center;">
            <div>
              <div style="font-size:13px;letter-spacing:2px;text-transform:uppercase;color:#99582a;margin-bottom:8px;font-weight:600;">Sanctuary Experience</div>
              <h2 style="font-size:42px;font-family:'Playfair Display',Georgia,serif;margin:0 0 20px;line-height:1.2;">
                A place to breathe, heal, and <span class="rt-italic-text" style="color:#99582a;">rediscover balance</span>
              </h2>
              <p style="font-size:16px;line-height:1.7;color:#444;margin-bottom:24px;">
                ${esc(text('company-about') || draft.company.aboutStory || draft.company.description || 'Our sanctuary blends clean Nordic minimalism with tranquil Eastern Zen sensibilities. With natural daylight, organic linen bolsters, and expert guidance, every detail supports your inner journey.')}
              </p>
              <div style="display:flex;gap:20px;">
                <a href="${esc(path('about'))}" style="color:#99582a;font-weight:600;text-decoration:none;font-size:15px;" data-wr-page="about">Learn more about our space →</a>
              </div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
              <img data-wr-material-image="whyus-main" src="${esc(image('whyus-main'))}" alt="Sanctuary teacher" style="border-radius:20px;width:100%;aspect-ratio:3/4;object-fit:cover;">
              <img data-wr-material-image="whyus-secondary" src="${esc(image('whyus-secondary'))}" alt="Sanctuary space" style="border-radius:20px;width:100%;aspect-ratio:3/4;object-fit:cover;margin-top:28px;">
            </div>
          </div>
        </div>
      </section>

      <!-- Featured Classes -->
      <section style="padding:80px 0;">
        <div class="w-layout-blockcontainer rt-container w-container">
          <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:40px;">
            <div>
              <div style="font-size:13px;letter-spacing:2px;text-transform:uppercase;color:#99582a;margin-bottom:8px;font-weight:600;">Daily Schedule</div>
              <h2 style="font-size:38px;font-family:'Playfair Display',Georgia,serif;margin:0;">
                Featured <span class="rt-italic-text" style="color:#99582a;">classes</span>
              </h2>
            </div>
            <a href="${esc(path('catalog'))}" style="color:#99582a;font-weight:600;text-decoration:none;font-size:15px;" data-wr-page="catalog">View all classes →</a>
          </div>
          ${renderClassCards(products.slice(0, 8))}
        </div>
      </section>
    `;
  } else if (page === 'catalog') {
    mainContent = `
      <section style="padding:60px 0 20px;text-align:center;">
        <div class="w-layout-blockcontainer rt-container w-container">
          <div style="font-size:13px;letter-spacing:2px;text-transform:uppercase;color:#99582a;margin-bottom:8px;font-weight:600;">Class Schedule & Directory</div>
          <h1 style="font-size:46px;font-family:'Playfair Display',Georgia,serif;margin:0 0 16px;">
            Our Mindful <span class="rt-italic-text" style="color:#99582a;">Classes</span>
          </h1>
          <p style="font-size:17px;color:#555;max-width:600px;margin:0 auto 36px;line-height:1.6;">
            Explore our curated schedule of gentle flows, deep meditations, restorative sessions, and acoustic sound therapies.
          </p>
          <div style="display:inline-flex;background:#f5ede1;border-radius:30px;padding:4px;gap:8px;">
            <button type="button" data-auravell-tab="all" class="w--current" style="background:#ffffff;color:#2a2b2f;border:0;padding:8px 24px;border-radius:24px;cursor:pointer;font-weight:600;font-size:14px;">All Classes</button>
            <button type="button" data-auravell-tab="meditation" style="background:transparent;color:#666;border:0;padding:8px 24px;border-radius:24px;cursor:pointer;font-weight:500;font-size:14px;">Meditation</button>
            <button type="button" data-auravell-tab="yoga" style="background:transparent;color:#666;border:0;padding:8px 24px;border-radius:24px;cursor:pointer;font-weight:500;font-size:14px;">Yoga Flow</button>
          </div>
          <img data-wr-material-image="class-hero" src="${esc(image('class-hero'))}" alt="Class studio" style="width:100%;height:240px;object-fit:cover;border-radius:20px;margin-top:32px;">${renderClassCards(products)}
        </div>
      </section>
    `;
  } else if (page === 'about') {
    mainContent = `
      <section style="padding:80px 0 40px;">
        <div class="w-layout-blockcontainer rt-container w-container">
          <div style="max-width:760px;margin:0 auto;text-align:center;">
            <div style="font-size:13px;letter-spacing:2px;text-transform:uppercase;color:#99582a;margin-bottom:8px;font-weight:600;">Our Philosophy</div>
            <h1 style="font-size:48px;font-family:'Playfair Display',Georgia,serif;margin:0 0 24px;line-height:1.15;">
              Rooted in nature, guided by <span class="rt-italic-text" style="color:#99582a;">presence</span>
            </h1>
            <p style="font-size:18px;line-height:1.7;color:#444;margin-bottom:48px;">
              ${esc(text('company-about') || draft.company.aboutStory || draft.company.description || 'Auravell was born from a desire to bring mindful balance to modern lives. We believe that true well-being comes from honoring the dialogue between physical posture, slow breath, and inner stillness.')}
            </p>
          </div>
          <div style="border-radius:24px;overflow:hidden;box-shadow:0 12px 36px rgba(0,0,0,0.06);margin-bottom:80px;">
            <img data-wr-material-image="about-hero" src="${esc(image('about-hero'))}" alt="Sanctuary Studio" style="width:100%;height:460px;object-fit:cover;">
          </div>
          <div style="display:grid;grid-template-columns:repeat(3, minmax(0, 1fr));gap:32px;">
            <div style="background:#ffffff;border-radius:20px;padding:32px;border:1px solid #ebdccb;">
              <h3 style="font-size:20px;margin:0 0 10px;font-family:'Playfair Display',Georgia,serif;">Organic Atmosphere</h3>
              <p style="font-size:14px;line-height:1.6;color:#555;">Handmade natural materials, non-toxic acoustic panels, and warm botanical aromas ensure you breathe easy from the moment you step inside.</p>
            </div>
            <div style="background:#ffffff;border-radius:20px;padding:32px;border:1px solid #ebdccb;">
              <h3 style="font-size:20px;margin:0 0 10px;font-family:'Playfair Display',Georgia,serif;">Practice Guidance</h3>
              <p style="font-size:14px;line-height:1.6;color:#555;">${esc(draft.company.certifications || (demo ? 'Ask our team about instructor qualifications and available guidance.' : 'Contact our team for information about instructors and available guidance.'))}</p>
            </div>
            <div style="background:#ffffff;border-radius:20px;padding:32px;border:1px solid #ebdccb;">
              <h3 style="font-size:20px;margin:0 0 10px;font-family:'Playfair Display',Georgia,serif;">Small Sanctuary Groups</h3>
              <p style="font-size:14px;line-height:1.6;color:#555;">We limit class capacity to provide personalized hands-on adjustments and ensure every participant feels seen and nurtured.</p>
            </div>
          </div>
        </div>
      </section>
    `;
  } else if (page === 'plans') {
    mainContent = `
      <section style="padding:80px 0;">
        <div class="w-layout-blockcontainer rt-container w-container">
          <div style="text-align:center;max-width:680px;margin:0 auto 56px;">
            <div style="font-size:13px;letter-spacing:2px;text-transform:uppercase;color:#99582a;margin-bottom:8px;font-weight:600;">Transparent Pricing</div>
            <h1 style="font-size:46px;font-family:'Playfair Display',Georgia,serif;margin:0 0 16px;">
              Memberships & <span class="rt-italic-text" style="color:#99582a;">Passes</span>
            </h1>
            <p style="font-size:17px;color:#555;line-height:1.6;">
              Choose the rhythm that matches your life. From flexible single passes to unlimited sanctuary memberships.
            </p>
          </div>
          <div style="display:grid;grid-template-columns:repeat(3, minmax(0, 1fr));gap:32px;">
            <div style="background:#ffffff;border-radius:24px;padding:40px;border:1px solid #ebdccb;display:flex;flex-direction:column;">
              <h3 style="font-size:22px;margin:0 0 8px;font-family:'Playfair Display',Georgia,serif;">Single Session Pass</h3>
              <div style="font-size:36px;font-weight:700;color:#2a2b2f;margin-bottom:20px;">$28 <span style="font-size:14px;font-weight:400;color:#666;">/ class</span></div>
              <ul style="list-style:none;padding:0;margin:0 0 32px;flex-grow:1;line-height:2.2;font-size:14px;color:#555;">
                <li>✓ Access to any standard 60m class</li>
                <li>✓ Organic mat & bolster provided</li>
                <li>✓ Herbal tea post-session</li>
              </ul>
              <a href="${esc(path('contact'))}" style="background:#f5ede1;color:#2a2b2f;text-decoration:none;padding:12px;border-radius:30px;text-align:center;font-weight:600;" data-wr-page="contact">Select Pass</a>
            </div>
            <div style="background:#ffffff;border-radius:24px;padding:40px;border:2px solid ${brandAccent};position:relative;display:flex;flex-direction:column;box-shadow:0 12px 30px rgba(153,88,42,0.12);">
              <div style="position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:${brandAccent};color:#ffffff;font-size:11px;padding:4px 16px;border-radius:20px;font-weight:700;text-transform:uppercase;">Most Popular</div>
              <h3 style="font-size:22px;margin:0 0 8px;font-family:'Playfair Display',Georgia,serif;">Monthly Sanctuary</h3>
              <div style="font-size:36px;font-weight:700;color:#2a2b2f;margin-bottom:20px;">$160 <span style="font-size:14px;font-weight:400;color:#666;">/ month</span></div>
              <ul style="list-style:none;padding:0;margin:0 0 32px;flex-grow:1;line-height:2.2;font-size:14px;color:#555;">
                <li>✓ 8 classes per month</li>
                <li>✓ Priority booking window</li>
                <li>✓ 1 sound bath experience included</li>
                <li>✓ Guest pass each month</li>
              </ul>
              <a href="${esc(path('contact'))}" style="background:${brandAccent};color:#ffffff;text-decoration:none;padding:12px;border-radius:30px;text-align:center;font-weight:600;" data-wr-page="contact">Join Sanctuary</a>
            </div>
            <div style="background:#ffffff;border-radius:24px;padding:40px;border:1px solid #ebdccb;display:flex;flex-direction:column;">
              <h3 style="font-size:22px;margin:0 0 8px;font-family:'Playfair Display',Georgia,serif;">Unlimited Annual</h3>
              <div style="font-size:36px;font-weight:700;color:#2a2b2f;margin-bottom:20px;">$1,500 <span style="font-size:14px;font-weight:400;color:#666;">/ year</span></div>
              <ul style="list-style:none;padding:0;margin:0 0 32px;flex-grow:1;line-height:2.2;font-size:14px;color:#555;">
                <li>✓ Unlimited classes throughout the year</li>
                <li>✓ All workshops and sound baths included</li>
                <li>✓ Personalized 1-on-1 posture checkup</li>
                <li>✓ Private locker & organic mat storage</li>
              </ul>
              <a href="${esc(path('contact'))}" style="background:#f5ede1;color:#2a2b2f;text-decoration:none;padding:12px;border-radius:30px;text-align:center;font-weight:600;" data-wr-page="contact">Select Annual</a>
            </div>
          </div>
        </div>
      </section>
    `;
  } else if (page === 'contact') {
    mainContent = `
      <section style="padding:60px 0 80px;">
        <div class="w-layout-blockcontainer rt-container w-container">
          <div style="display:grid;grid-template-columns:1fr 1.2fr;gap:64px;align-items:start;">
            <div>
              <div style="font-size:13px;letter-spacing:2px;text-transform:uppercase;color:#99582a;margin-bottom:8px;font-weight:600;">Visit & Connect</div>
              <h1 style="font-size:44px;font-family:'Playfair Display',Georgia,serif;margin:0 0 20px;">
                Get in <span class="rt-italic-text" style="color:#99582a;">touch</span>
              </h1>
              <p style="font-size:16px;line-height:1.7;color:#555;margin-bottom:32px;">
                Have questions about our schedule, class styles, or private sessions? We invite you to contact our team or visit our quiet studio.
              </p>
              <div style="margin-bottom:24px;">
                <h4 style="font-size:14px;text-transform:uppercase;color:#99582a;letter-spacing:1px;margin:0 0 6px;">Studio Location</h4>
                <p style="margin:0;color:#333;font-size:15px;">${esc(draft.company.address || (demo ? '410 Sandtown, California 94001, USA' : ''))}</p>
              </div>
              <div style="margin-bottom:24px;">
                <h4 style="font-size:14px;text-transform:uppercase;color:#99582a;letter-spacing:1px;margin:0 0 6px;">Direct Contact</h4>
                <p style="margin:0 0 4px;color:#333;font-size:15px;">Email: <a href="mailto:${esc(draft.company.email || (demo ? 'info@auravell.com' : ''))}" style="color:#99582a;">${esc(draft.company.email || (demo ? 'info@auravell.com' : ''))}</a></p>
                <p style="margin:0;color:#333;font-size:15px;">Phone: <a href="tel:${esc(draft.company.phone || (demo ? '(888) 456 7890' : ''))}" style="color:#99582a;">${esc(draft.company.phone || (demo ? '(888) 456 7890' : ''))}</a></p>
              </div>
              <div>
                <h4 style="font-size:14px;text-transform:uppercase;color:#99582a;letter-spacing:1px;margin:0 0 6px;">Open Hours</h4>
                <p style="margin:0 0 4px;color:#333;font-size:15px;">Monday – Friday: 06:30 AM – 09:00 PM</p>
                <p style="margin:0;color:#333;font-size:15px;">Saturday – Sunday: 08:00 AM – 06:00 PM</p>
              </div>
            </div>
            <div>
              ${formHtml}
            </div>
          </div>
        </div>
      </section>
    `;
  } else if (page === 'detail' && selected) {
    const p = ctx.translateProduct(selected);
    const photo = ctx.asset(selected.imageAssetId) || '/templates/auravell/images/6a7d651d45031f173673109f_f686c4255802fa9f938b7bf22f73da0f_yoga-site-image-one.avif';
    const gallery = [
      { assetId: selected.imageAssetId, caption: p.name },
      ...(selected.gallery || []),
    ].filter((g, i, all) => g.assetId && all.findIndex((v) => v.assetId === g.assetId) === i);

    mainContent = `
      <section class="auravell-detail-section">
        <div class="auravell-detail-gallery">
          <img id="wr-detail-main-img" class="auravell-detail-main-img" src="${esc(photo)}" alt="${esc(p.name)}" loading="eager" fetchpriority="high" data-wr-material-image="product-main" data-wr-material-product="${esc(selected.id)}">
          ${
            gallery.length > 1
              ? `
            <div class="auravell-detail-thumbs senseng-detail-thumbs">
              ${gallery
                .map(
                  (g, i) => `
                <button type="button" class="auravell-detail-thumb wr-detail-thumb ${i === 0 ? 'active' : ''}" data-wr-material-thumb data-src="${esc(ctx.asset(g.assetId))}" aria-label="View photo ${i + 1}" aria-pressed="${i === 0}">
                  <img src="${esc(ctx.asset(g.assetId))}" alt="${esc(g.caption || p.name)}" loading="lazy">
                </button>
              `,
                )
                .join('')}
            </div>
          `
              : ''
          }
          <div style="margin-top:20px;">
            <a href="${esc(path('catalog'))}" style="color:#99582a;text-decoration:none;font-size:14px;font-weight:600;" data-wr-page="catalog">← Back to all classes</a>
          </div>
        </div>
        <div class="auravell-detail-content">
          <div style="font-size:13px;letter-spacing:2px;text-transform:uppercase;color:#99582a;margin-bottom:8px;font-weight:600;">
            ${esc(selected.material || 'Mindful Practice')}
          </div>
          <h1>${esc(p.name)}</h1>
          <p class="lead">${esc(selected.tagline || p.description)}</p>
          <div style="background:#ffffff;border-radius:16px;padding:24px;border:1px solid #ebdccb;margin-bottom:28px;">
            <div style="font-size:15px;font-weight:600;margin-bottom:12px;color:#2a2b2f;">Class Details</div>
            <div style="display:flex;gap:24px;font-size:14px;color:#555;">
              <span><strong>Duration:</strong> ${esc(selected.material || '60 mins')}</span>
              <span><strong>Schedule:</strong> ${esc(selected.dimensions || 'Weekly sessions')}</span>
            </div>
          </div>
          ${
            selected.sellingPoints?.length
              ? `
            <h3 style="font-size:20px;font-family:'Playfair Display',Georgia,serif;margin:0 0 12px;">What to Expect</h3>
            <ul class="auravell-detail-features">
              ${selected.sellingPoints.map((pt) => `<li>${esc(pt)}</li>`).join('')}
            </ul>
          `
              : ''
          }
          ${formHtml}
        </div>
      </section>
    `;
  }

  // Preserve layout while applying explicit desktop/mobile material crops.
  mainContent = mainContent.replace(/<img\b[^>]*data-wr-material-image="([^"]+)"[^>]*>/g, (tag, id: string) => {
    const b = draft.materials?.imageBindings.find(b => b.slotId === id && (!b.productId || b.productId === selected?.id));
    if (!b || !ctx.asset(b.assetId)) return tag;
    const pt = b.focalPoint || {x: .5, y: .5}, mp = b.mobileFocalPoint || pt;
    const crop = `object-fit:${b.fit} !important;--auravell-position:${pt.x * 100}% ${pt.y * 100}%;--auravell-mobile-position:${mp.x * 100}% ${mp.y * 100}%;`;
    let rendered = tag.replace(/\s(?:src|srcset|alt)="[^"]*"/g, '').replace(/>$/, ` src="${esc(ctx.asset(b.assetId))}" alt="${esc(b.alt[options.lang] || '')}">`);
    rendered = /style="/.test(rendered) ? rendered.replace('style="', `style="${crop}`) : rendered.replace(/>$/, ` style="${crop}">`);
    return b.mobileAssetId ? `<picture class="auravell-picture"><source media="(max-width:600px)" srcset="${esc(ctx.asset(b.mobileAssetId))}">${rendered}</picture>` : rendered;
  });
  const customPalette = `
    :root {
      --_colors---accent-color--accent-100: ${brandAccent};
    }
    .auravell .rt-footer .rt-button-v1, .auravell .rt-hero .rt-hero-v1-left-content .rt-button-v1, .rt-button-v1, .auravell-inquiry-box button[type="submit"] {
      background-color: ${brandAccent} !important;
      color: ${ctx.brandInk} !important;
    }
    img[data-wr-material-image] { object-position: var(--auravell-position, 50% 50%) !important; }
    .auravell-picture { display: contents; }
    @media(max-width:600px) { img[data-wr-material-image] { object-position: var(--auravell-mobile-position, 50% 50%) !important; } }
    .rt-italic-text, h1 em, h2 em, h3 em, h4 em, h5 em, h6 em {
      color: ${brandAccent} !important;
    }
  `;

  return `<!doctype html>
<html lang="${esc(options.lang)}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  ${options.preview ? '<meta name="robots" content="noindex,nofollow">' : ''}
  <link rel="stylesheet" href="/templates/auravell/css/fonts.css">
  <link rel="stylesheet" href="/templates/auravell/css/auravell.css">
  <link rel="stylesheet" href="/templates/auravell/css/auravell-fixes.css">
  <style>
    ${auravellFixes}
    ${customPalette}
  </style>
</head>
<body class="auravell${draft.materials ? ' wr-materials-site' : ''}${options.preview ? ' auravell-preview-mode' : ''}" data-template="auravell" data-auravell-preview="${!!options.preview}">
  ${options.preview ? '<div style="background:#f5ede1;color:#99582a;font-size:13px;padding:8px;text-align:center;border-bottom:1px solid #ebdccb;font-weight:500;">Private preview · Inquiry sending is disabled</div>' : ''}
  ${navHtml}
  <main>
    ${mainContent}
  </main>
  ${footerHtml}
  <script>
    var __name = (value) => value;
    (${auravellRuntime.toString()})();
    (${materialsRuntime.toString()})();
  </script>
</body>
</html>`;
}
