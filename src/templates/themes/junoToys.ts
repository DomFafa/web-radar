import { esc, safeUrl, type ThemeContext } from './types';
import { getAboutHeadline, getAboutStoryParagraphs, getAboutImages, parseAboutHighlights } from './aboutHelper';
import { isTypedMaterialsSource } from '../materials-typed';

export function renderToysHome(ctx: ThemeContext): string {
  const { draft, ui, path, navAttrs, asset, translateProduct } = ctx;
  const company = draft.company;
  const copy = draft.copy[ctx.lang] ?? {
    headline: 'Safe, Creative Toys & Games for Curious Growing Minds',
    subtitle: 'Crafted with eco-friendly natural wood, BPA-free organic materials, and boundless imagination for children of all ages.',
    about: 'At Juno Toys, we believe childhood is sacred. Every toy we create undergoes rigorous multi-stage safety testing to spark curiosity, motor skills, and joyful family memories.',
    cta: 'Explore Bestselling Toys',
  };

  // 1. Cheerful Top Bar
  const topBarHtml = `
    <div style="background:#fef08a;color:#78350f;padding:10px 0;font-size:0.85rem;font-weight:700;border-bottom:1px solid #fde047;">
      <div class="wrap" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
        <div style="display:flex;align-items:center;gap:10px;">
          <span>🎉 FREE Worldwide Eco-Shipping on orders over $60!</span>
        </div>
        <div style="display:flex;align-items:center;gap:16px;">
          <span>🌱 100% Plastic-Neutral Packaging</span>
          <span>·</span>
          <span>🛡️ ASTM & EN71 Certified Child-Safe</span>
        </div>
      </div>
    </div>
  `;

  // 2. Hero Section
  const heroHtml = `
    <section class="hero" aria-label="${esc(copy.headline)}" style="background:linear-gradient(135deg,#fef08a 0%,#fed7aa 50%,#fbcfe8 100%);color:#451a03;padding:90px 0 80px;position:relative;overflow:hidden;">
      <div class="wrap hero-content" style="position:relative;z-index:2;text-align:center;align-items:center;margin:0 auto;">
        <div class="wr-hero-float" data-reveal="fade-up" style="display:inline-flex;align-items:center;gap:8px;background:#ffffff;border:2px solid #fde047;padding:8px 22px;border-radius:9999px;margin-bottom:24px;box-shadow:0 4px 14px rgba(245,158,11,0.15);">
          <span style="font-size:1.1rem;">🧸</span>
          <span style="font-size:0.84rem;font-weight:900;color:#92400e;letter-spacing:0.06em;text-transform:uppercase;">SUSTAINABLE PLAY · JUNO TOYS COLLECTION</span>
        </div>
        <h1 class="hero-title" data-reveal="fade-up" style="font-size:clamp(2.8rem, 5.8vw, 4.8rem);line-height:1.08;font-weight:900;letter-spacing:-0.03em;color:#78350f;max-width:900px;margin:0 auto 20px;text-align:center;">
          ${esc(copy.headline)}
        </h1>
        <p data-reveal="fade-up" style="max-width:680px;color:#92400e;font-size:1.22rem;line-height:1.65;margin:0 auto 36px;text-align:center;">
          ${esc(copy.subtitle)}
        </p>
        <div data-reveal="fade-up" style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap;">
          <a class="button" style="background:#f59e0b;color:#ffffff;font-weight:900;border-radius:9999px;padding:16px 36px;box-shadow:0 8px 24px rgba(245,158,11,0.4);font-size:0.92rem;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>
            ${esc(copy.cta || 'Shop Bestsellers')} ↗
          </a>
          <a class="button" style="background:#ffffff;color:#78350f;border:2px solid #fed7aa;border-radius:9999px;padding:16px 32px;font-weight:800;font-size:0.92rem;" href="${path('contact/index.html')}" ${navAttrs('contact')}>
            Order Custom Gift Bundle →
          </a>
        </div>

        <div data-reveal="fade-up" style="margin-top:42px;display:flex;gap:28px;justify-content:center;flex-wrap:wrap;color:#92400e;font-size:0.9rem;font-weight:700;">
          <div>✨ Non-Toxic Natural Dyes</div>
          <div>🪵 FSC-Certified Beechwood</div>
          <div>❤️ Loved by 150,000+ Happy Families</div>
        </div>
        <a href="#safety" class="wr-scroll-down" aria-label="Scroll to content">↓</a>
      </div>
    </section>
  `;

  // 3. Safety & Material Guarantees
  const safetyHtml = `
    <section id="safety" class="wrap" style="padding:48px 0 32px;">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px;">
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:3px solid #fef08a;border-radius:20px;padding:26px;text-align:center;box-shadow:0 6px 16px rgba(245,158,11,0.08);">
          <div style="font-size:2.5rem;margin-bottom:8px;">🌱</div>
          <div style="font-weight:900;color:#78350f;font-size:1.1rem;">100% Non-Toxic</div>
          <div style="font-size:0.86rem;color:#92400e;margin-top:6px;line-height:1.5;">Food-grade water-based lacquers and natural vegetable dyes safe for teething babies.</div>
        </div>
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:3px solid #fef08a;border-radius:20px;padding:26px;text-align:center;box-shadow:0 6px 16px rgba(245,158,11,0.08);">
          <div style="font-size:2.5rem;margin-bottom:8px;">🪵</div>
          <div style="font-weight:900;color:#78350f;font-size:1.1rem;">FSC-Certified Wood</div>
          <div style="font-size:0.86rem;color:#92400e;margin-top:6px;line-height:1.5;">Responsibly harvested European beech and maple that will last for generations.</div>
        </div>
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:3px solid #fef08a;border-radius:20px;padding:26px;text-align:center;box-shadow:0 6px 16px rgba(245,158,11,0.08);">
          <div style="font-size:2.5rem;margin-bottom:8px;">🛡️</div>
          <div style="font-weight:900;color:#78350f;font-size:1.1rem;">ASTM & EN71 Tested</div>
          <div style="font-size:0.86rem;color:#92400e;margin-top:6px;line-height:1.5;">Independently certified by global laboratory testing for drop, choke, and chemical safety.</div>
        </div>
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:3px solid #fef08a;border-radius:20px;padding:26px;text-align:center;box-shadow:0 6px 16px rgba(245,158,11,0.08);">
          <div style="font-size:2.5rem;margin-bottom:8px;">🎁</div>
          <div style="font-weight:900;color:#78350f;font-size:1.1rem;">100-Day Happiness</div>
          <div style="font-size:0.86rem;color:#92400e;margin-top:6px;line-height:1.5;">Love your toys or return them completely free of charge. No questions asked.</div>
        </div>
      </div>
    </section>
  `;

  // 4. Products & Bestsellers
  const products = draft.products.slice(0, 6);
  const productsHtml = `
    <section class="wrap chapter" style="padding:60px 0;">
      <div class="section-top" style="margin-bottom:36px;">
        <div>
          <span class="eyebrow" style="color:#d97706;font-weight:900;">LOVED BY LITTLE ONES</span>
          <h2 style="font-size:clamp(2rem, 3.5vw, 2.8rem);margin-top:8px;color:#78350f;font-weight:900;">Featured Educational Toys &amp; Play Sets</h2>
        </div>
        <a class="text-link" style="color:#d97706;font-weight:800;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>
          ${esc(ui.allProducts)} ↗
        </a>
      </div>
      <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(290px,1fr));gap:28px;">
        ${products.map((p, idx) => {
          const t = translateProduct(p);
          const imgUrl = ctx.productMainImage(p);
          const badges = ['Ages 0 - 2', 'Ages 3-5', 'STEM 6+', 'Creative', 'Montessori', 'Toddler'];
          return `
            <article class="product-card wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:3px solid #fef08a;border-radius:24px;padding:24px;display:flex;flex-direction:column;justify-content:space-between;box-shadow:0 8px 20px rgba(245,158,11,0.08);">
              <div>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
                  <span style="font-size:0.75rem;font-weight:900;color:#b45309;background:#fef3c7;padding:4px 12px;border-radius:9999px;">${badges[idx % badges.length]}</span>
                  <span style="color:#f59e0b;font-size:0.9rem;">★★★★★</span>
                </div>
                ${imgUrl ? `<div class="product-image" style="border-radius:18px;overflow:hidden;margin-bottom:16px;max-height:200px;"><img src="${esc(imgUrl)}" alt="${esc(t.name)}" data-wr-product-slot="${idx}" loading="lazy"></div>` : ''}
                <h3 style="color:#78350f;margin:0 0 8px;font-size:1.3rem;font-weight:900;">${esc(t.name)}</h3>
                <p style="color:#92400e;line-height:1.6;font-size:0.92rem;margin:0 0 18px;">${esc(t.description || 'Delightful non-toxic developmental toy stimulating sensory creativity.')}</p>
              </div>
              <div style="border-top:2px dashed #fef08a;padding-top:16px;margin-top:auto;">
                <a class="text-link" style="color:#d97706;font-weight:900;font-size:0.9rem;" href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)}>
                  View Toy Details & Safety Specs →
                </a>
              </div>
            </article>
          `;
        }).join('')}
      </div>
    </section>
  `;

  // 5. Age Category Explorer
  const ageCategoriesHtml = `
    <section class="wrap" style="padding:60px 0;border-top:2px dashed #fde047;">
      <div style="text-align:center;margin-bottom:40px;">
        <span class="eyebrow" style="color:#d97706;font-weight:900;">SHOP BY STAGE</span>
        <h2 style="font-size:2.2rem;color:#78350f;font-weight:900;margin:8px 0;">Find the Perfect Toy for Every Milestone</h2>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:20px;">
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#fffbeb;border:2px solid #fef08a;border-radius:20px;padding:24px;text-align:center;">
          <div style="font-size:2.8rem;margin-bottom:8px;">👶</div>
          <h4 style="color:#78350f;font-weight:900;margin:0 0 6px;font-size:1.15rem;">Baby & Toddler</h4>
          <div style="font-size:0.85rem;color:#92400e;">Teethers, grasping rattles & sensory play mats (0-2 Yrs)</div>
        </div>
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#fffbeb;border:2px solid #fef08a;border-radius:20px;padding:24px;text-align:center;">
          <div style="font-size:2.8rem;margin-bottom:8px;">🎨</div>
          <h4 style="color:#78350f;font-weight:900;margin:0 0 6px;font-size:1.15rem;">Preschool Creators</h4>
          <div style="font-size:0.85rem;color:#92400e;">Pretend kitchens, stacking blocks & wooden train tracks (3-5 Yrs)</div>
        </div>
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#fffbeb;border:2px solid #fef08a;border-radius:20px;padding:24px;text-align:center;">
          <div style="font-size:2.8rem;margin-bottom:8px;">🔬</div>
          <h4 style="color:#78350f;font-weight:900;margin:0 0 6px;font-size:1.15rem;">STEM & Building</h4>
          <div style="font-size:0.85rem;color:#92400e;">Magnetic construction sets, science kits & gears (6-8 Yrs)</div>
        </div>
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#fffbeb;border:2px solid #fef08a;border-radius:20px;padding:24px;text-align:center;">
          <div style="font-size:2.8rem;margin-bottom:8px;">🎲</div>
          <h4 style="color:#78350f;font-weight:900;margin:0 0 6px;font-size:1.15rem;">Family Games</h4>
          <div style="font-size:0.85rem;color:#92400e;">Board games, cooperative puzzles & outdoor classics (8+ Yrs)</div>
        </div>
      </div>
    </section>
  `;

  // 6. Testimonials
  const testimonialsHtml = `
    <section class="wrap" style="padding:60px 0;">
      <div style="text-align:center;margin-bottom:36px;">
        <span class="eyebrow" style="color:#d97706;font-weight:900;">HAPPY PARENTS</span>
        <h2 style="font-size:2.1rem;color:#78350f;font-weight:900;margin:8px 0;">Real Stories from Playrooms Around the World</h2>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:24px;">
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:2px solid #fef08a;border-radius:20px;padding:28px;box-shadow:0 4px 14px rgba(245,158,11,0.06);">
          <div style="color:#f59e0b;font-size:1rem;margin-bottom:12px;">★★★★★</div>
          <p style="color:#78350f;line-height:1.7;font-size:0.95rem;margin:0 0 18px;">"The quality of the wooden train set is incredible. My 3-year-old hasn't stopped playing with it for three months straight!"</p>
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:40px;height:40px;border-radius:50%;background:#fde047;color:#78350f;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:0.9rem;">ES</div>
            <div><div style="font-weight:900;color:#78350f;font-size:0.9rem;">Emily Simmons</div><div style="color:#92400e;font-size:0.8rem;">Mom of two, Seattle WA</div></div>
          </div>
        </div>
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:2px solid #fef08a;border-radius:20px;padding:28px;box-shadow:0 4px 14px rgba(245,158,11,0.06);">
          <div style="color:#f59e0b;font-size:1rem;margin-bottom:12px;">★★★★★</div>
          <p style="color:#78350f;line-height:1.7;font-size:0.95rem;margin:0 0 18px;">"Knowing every edge is smooth and all the paints are completely non-toxic gives me so much peace of mind."</p>
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:40px;height:40px;border-radius:50%;background:#fed7aa;color:#78350f;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:0.9rem;">JT</div>
            <div><div style="font-weight:900;color:#78350f;font-size:0.9rem;">Jonathan Taylor</div><div style="color:#92400e;font-size:0.8rem;">Father of toddler, Austin TX</div></div>
          </div>
        </div>
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:2px solid #fef08a;border-radius:20px;padding:28px;box-shadow:0 4px 14px rgba(245,158,11,0.06);">
          <div style="color:#f59e0b;font-size:1rem;margin-bottom:12px;">★★★★★</div>
          <p style="color:#78350f;line-height:1.7;font-size:0.95rem;margin:0 0 18px;">"Beautiful design that looks gorgeous in the living room rather than plastic clutter. Absolutely love Juno Toys!"</p>
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:40px;height:40px;border-radius:50%;background:#fbcfe8;color:#78350f;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:0.9rem;">MC</div>
            <div><div style="font-weight:900;color:#78350f;font-size:0.9rem;">Maria Chen</div><div style="color:#92400e;font-size:0.8rem;">Kindergarten Teacher & Mom</div></div>
          </div>
        </div>
      </div>
    </section>
  `;

  // 7. Juno Club Newsletter / CTA Banner
  const contactBandHtml = `
    <section class="contact-band" style="background:#78350f;color:#fffdf5;padding:80px 0;border-top:4px solid #f59e0b;">
      <div class="wrap" data-reveal="fade-up" style="display:flex;justify-content:space-between;align-items:center;gap:40px;flex-wrap:wrap;">
        <div>
          <span class="eyebrow" style="color:#fde047;font-weight:900;">JOIN THE JUNO FAMILY CLUB</span>
          <h2 style="font-size:2.4rem;margin:10px 0;max-width:650px;color:#fffdf5;font-weight:900;">
            Get 15% Off Your First Order + Free Toy Safety Guide!
          </h2>
          <p style="color:#fed7aa;font-size:1.1rem;margin:0;max-width:520px;">Sign up to receive developmental play ideas, milestone gift guides, and early access to new releases.</p>
        </div>
        <div style="display:flex;gap:14px;flex-wrap:wrap;">
          <a class="button" style="background:#f59e0b;color:#ffffff;font-weight:900;border-radius:9999px;padding:16px 36px;box-shadow:0 8px 24px rgba(245,158,11,0.4);" href="${path('contact/index.html')}" ${navAttrs('contact')}>
            Claim 15% Member Discount ↗
          </a>
        </div>
      </div>
    </section>
  `;

  return `${topBarHtml}${heroHtml}${safetyHtml}${productsHtml}${ageCategoriesHtml}${testimonialsHtml}${contactBandHtml}`;
}

function renderLegacyToysAbout(ctx: ThemeContext): string {
  const { draft, ui, path, navAttrs, asset } = ctx;
  const company = draft.company;
  const copy = draft.copy[ctx.lang] ?? {
    about: 'At Juno Toys, we believe childhood is sacred. Every toy we create undergoes rigorous multi-stage safety testing to spark curiosity, motor skills, and joyful family memories.',
  };

  const headline = company.aboutHeadline || 'Handcrafted Joy for Curious Minds';
  const customImg = company.aboutImageAssetId ? asset(company.aboutImageAssetId) : '';
  const customHighlights = company.aboutHighlights ? parseAboutHighlights(company.aboutHighlights) : null;
  const customStoryParas = company.aboutStory ? getAboutStoryParagraphs(company) : null;

  const heroHtml = `
    <section class="juno-inner-hero" style="background:linear-gradient(135deg,#fef08a 0%,#fed7aa 50%,#fbcfe8 100%);color:#451a03;padding:80px 0 60px;position:relative;overflow:hidden;border-bottom:3px solid #fde047;">
      <div class="wrap" style="position:relative;z-index:2;text-align:center;">
        <div style="display:inline-flex;align-items:center;gap:8px;background:#ffffff;border:2px solid #fde047;padding:6px 20px;border-radius:9999px;margin-bottom:20px;box-shadow:0 4px 14px rgba(245,158,11,0.12);">
          <span style="font-size:1.1rem;">🧸</span>
          <span style="font-size:0.84rem;font-weight:900;color:#92400e;letter-spacing:0.06em;text-transform:uppercase;">THE JUNO WORKSHOP STORY</span>
        </div>
        <h1 style="font-size:clamp(2.6rem,5.5vw,4.4rem);line-height:1.08;font-weight:900;letter-spacing:-0.03em;color:#78350f;max-width:880px;margin:0 auto 20px;">
          ${esc(headline)}
        </h1>
        <p style="max-width:680px;color:#92400e;font-size:1.2rem;line-height:1.65;margin:0 auto;">
          ${esc(copy.about)}
        </p>
      </div>
    </section>
  `;

  const statsHtml = customHighlights ? `
    <section class="wrap" style="padding:50px 0 30px;">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px;">
        ${customHighlights.map((h) => `
          <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:3px solid #fef08a;border-radius:24px;padding:26px;text-align:center;box-shadow:0 6px 16px rgba(245,158,11,0.06);">
            <div style="font-size:2.8rem;font-weight:900;color:#f59e0b;">
              <span data-counter="${esc(h.value)}" ${h.prefix ? `data-prefix="${esc(h.prefix)}"` : ''} ${h.suffix ? `data-suffix="${esc(h.suffix)}"` : ''}>
                ${esc(h.prefix || '')}${esc(h.value)}${esc(h.suffix || '')}
              </span>
            </div>
            <div style="font-weight:900;color:#78350f;font-size:1.05rem;margin-top:4px;">${esc(h.label)}</div>
            ${h.desc ? `<div style="font-size:0.85rem;color:#92400e;margin-top:4px;line-height:1.5;">${esc(h.desc)}</div>` : ''}
          </div>
        `).join('')}
      </div>
    </section>
  ` : `
    <section class="wrap" style="padding:50px 0 30px;">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px;">
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:3px solid #fef08a;border-radius:24px;padding:26px;text-align:center;box-shadow:0 6px 16px rgba(245,158,11,0.06);">
          <div style="font-size:2.8rem;font-weight:900;color:#f59e0b;"><span data-counter="150" data-suffix="K+">150K+</span></div>
          <div style="font-weight:900;color:#78350f;font-size:1.05rem;margin-top:4px;">Smiling Families</div>
          <div style="font-size:0.85rem;color:#92400e;margin-top:4px;line-height:1.5;">Filling living rooms and nurseries across 35 countries with laughter.</div>
        </div>
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:3px solid #fef08a;border-radius:24px;padding:26px;text-align:center;box-shadow:0 6px 16px rgba(245,158,11,0.06);">
          <div style="font-size:2.8rem;font-weight:900;color:#f59e0b;"><span data-counter="100" data-suffix="%">100%</span></div>
          <div style="font-weight:900;color:#78350f;font-size:1.05rem;margin-top:4px;">Plastic-Free Natural Toys</div>
          <div style="font-size:0.85rem;color:#92400e;margin-top:4px;line-height:1.5;">Responsibly harvested FSC European beech, organic cotton, and vegetable dyes.</div>
        </div>
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:3px solid #fef08a;border-radius:24px;padding:26px;text-align:center;box-shadow:0 6px 16px rgba(245,158,11,0.06);">
          <div style="font-size:2.8rem;font-weight:900;color:#f59e0b;"><span data-counter="0">0</span></div>
          <div style="font-weight:900;color:#78350f;font-size:1.05rem;margin-top:4px;">Toxic Chemicals</div>
          <div style="font-size:0.85rem;color:#92400e;margin-top:4px;line-height:1.5;">Zero BPA, zero phthalates, zero lead. Independently lab-tested to ASTM & EN71.</div>
        </div>
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:3px solid #fef08a;border-radius:24px;padding:26px;text-align:center;box-shadow:0 6px 16px rgba(245,158,11,0.06);">
          <div style="font-size:2.8rem;font-weight:900;color:#f59e0b;"><span data-counter="14" data-suffix=" Yrs">14 Yrs</span></div>
          <div style="font-weight:900;color:#78350f;font-size:1.05rem;margin-top:4px;">Dedicated Craftsmanship</div>
          <div style="font-size:0.85rem;color:#92400e;margin-top:4px;line-height:1.5;">Designing heirloom-quality wooden play sets that siblings pass down.</div>
        </div>
      </div>
    </section>
  `;

  const workshopHtml = `
    <section class="wrap" style="padding:50px 0 70px;">
      <div style="display:grid;grid-template-columns:1.1fr 1fr;gap:48px;align-items:center;">
        <div data-reveal="fade-up">
          <span class="eyebrow" style="color:#d97706;font-weight:900;">FROM OUR WOODEN BENCH TO YOUR PLAYROOM</span>
          <h2 style="font-size:2.4rem;line-height:1.15;color:#78350f;font-weight:900;margin:10px 0 20px;">
            Designed to Nurture Wonder, Not Screens
          </h2>
          ${customStoryParas ? `
            <div style="color:#92400e;font-size:1.05rem;line-height:1.75;display:flex;flex-direction:column;gap:16px;margin-bottom:28px;">
              ${customStoryParas.map((p) => `<p style="margin:0;">${esc(p)}</p>`).join('')}
            </div>
          ` : `
            <p style="color:#92400e;font-size:1.05rem;line-height:1.75;margin-bottom:20px;">
              Juno Toys was born in a modest Scandinavian woodworking studio with a simple wooden rocking horse made for a newborn daughter. Frustrated by disposable plastic toys with harsh sounds and fragile hinges, we resolved to return to heirloom craftsmanship.
            </p>
            <p style="color:#92400e;font-size:1.05rem;line-height:1.75;margin:0 0 28px;">
              Every contour is hand-sanded to a velvet-smooth touch, ensuring there are no sharp edges or splinters. Our finishes use food-grade plant oils and organic water-based pigments, making them entirely safe for teething and gentle exploring.
            </p>
          `}
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
            <div style="background:#fffbeb;border:2px solid #fef08a;border-radius:18px;padding:18px;">
              <strong style="color:#78350f;display:block;font-size:1rem;margin-bottom:4px;">🪵 FSC Certified Beech</strong>
              <span style="color:#92400e;font-size:0.85rem;">Sustainably managed forests replanting 3 trees for every harvested tree.</span>
            </div>
            <div style="background:#fffbeb;border:2px solid #fef08a;border-radius:18px;padding:18px;">
              <strong style="color:#78350f;display:block;font-size:1rem;margin-bottom:4px;">🎨 Natural Plant Pigments</strong>
              <span style="color:#92400e;font-size:0.85rem;">Derived from beetroot, turmeric, and spirulina extracts.</span>
            </div>
          </div>
        </div>

        <div class="wr-hero-float wr-card-hover" data-reveal="fade-up" style="background:#fffbeb;border:3px solid #fef08a;border-radius:28px;padding:36px;box-shadow:0 8px 24px rgba(245,158,11,0.06);">
          ${customImg ? `
            <div style="border-radius:20px;overflow:hidden;border:2px solid #fef08a;margin-bottom:20px;">
              <img src="${esc(customImg)}" alt="${esc(company.name)}" style="width:100%;height:220px;object-fit:cover;display:block;" loading="lazy">
            </div>
          ` : ''}
          <h3 style="font-size:1.35rem;font-weight:900;color:#78350f;margin:0 0 20px;">Our Four Guarantees to Parents</h3>
          <div style="display:flex;flex-direction:column;gap:18px;">
            <div style="display:flex;gap:14px;align-items:flex-start;">
              <div style="width:32px;height:32px;background:#fde047;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:900;color:#78350f;flex-shrink:0;">1</div>
              <div>
                <strong style="color:#78350f;font-size:0.95rem;">Unconditional Child Safety</strong>
                <p style="color:#92400e;font-size:0.85rem;line-height:1.5;margin:2px 0 0;">Each batch is sent to third-party labs for choke-tube, impact, and chemical assays.</p>
              </div>
            </div>
            <div style="display:flex;gap:14px;align-items:flex-start;">
              <div style="width:32px;height:32px;background:#fde047;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:900;color:#78350f;flex-shrink:0;">2</div>
              <div>
                <strong style="color:#78350f;font-size:0.95rem;">Open-Ended Play & Discovery</strong>
                <p style="color:#92400e;font-size:0.85rem;line-height:1.5;margin:2px 0 0;">No single "right" way to build—fostering spatial awareness, storytelling, and problem solving.</p>
              </div>
            </div>
            <div style="display:flex;gap:14px;align-items:flex-start;">
              <div style="width:32px;height:32px;background:#fde047;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:900;color:#78350f;flex-shrink:0;">3</div>
              <div>
                <strong style="color:#78350f;font-size:0.95rem;">100% Plastic Neutral Packaging</strong>
                <p style="color:#92400e;font-size:0.85rem;line-height:1.5;margin:2px 0 0;">Recycled kraft gift boxes with soy inks that fold flat for family recycling.</p>
              </div>
            </div>
            <div style="display:flex;gap:14px;align-items:flex-start;">
              <div style="width:32px;height:32px;background:#fde047;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:900;color:#78350f;flex-shrink:0;">4</div>
              <div>
                <strong style="color:#78350f;font-size:0.95rem;">Generational Heirloom Durability</strong>
                <p style="color:#92400e;font-size:0.85rem;line-height:1.5;margin:2px 0 0;">Engineered so your little one can one day pass their favourite puzzle on to their own children.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;

  const teamHtml = `
    <section class="wrap" style="padding:60px 0;border-top:2px dashed #fde047;">
      <div style="text-align:center;margin-bottom:44px;">
        <span class="eyebrow" style="color:#d97706;font-weight:900;">MEET THE CREATORS</span>
        <h2 style="font-size:2.2rem;color:#78350f;font-weight:900;margin:8px 0;">Toymakers & Child Development Specialists</h2>
        <p style="color:#92400e;max-width:620px;margin:0 auto;font-size:1rem;">A passionate crew of parents, woodturners, and early learning researchers designing with heart.</p>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:24px;">
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:3px solid #fef08a;border-radius:24px;padding:28px;text-align:center;box-shadow:0 6px 16px rgba(245,158,11,0.06);">
          <div style="width:64px;height:64px;border-radius:50%;background:#fde047;color:#78350f;font-weight:900;font-size:1.3rem;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">CL</div>
          <h3 style="font-size:1.2rem;color:#78350f;font-weight:900;margin:0 0 4px;">Clara Lindqvist</h3>
          <div style="color:#d97706;font-size:0.85rem;font-weight:800;margin-bottom:10px;">Founder & Master Toymaker</div>
          <p style="color:#92400e;font-size:0.85rem;line-height:1.5;margin:0;">Passionate woodturner and mother of three with 16 years designing sensory developmental toys.</p>
        </div>
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:3px solid #fef08a;border-radius:24px;padding:28px;text-align:center;box-shadow:0 6px 16px rgba(245,158,11,0.06);">
          <div style="width:64px;height:64px;border-radius:50%;background:#fed7aa;color:#78350f;font-weight:900;font-size:1.3rem;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">JS</div>
          <h3 style="font-size:1.2rem;color:#78350f;font-weight:900;margin:0 0 4px;">Dr. Julian Sterling</h3>
          <div style="color:#d97706;font-size:0.85rem;font-weight:800;margin-bottom:10px;">Child Development Psychologist</div>
          <p style="color:#92400e;font-size:0.85rem;line-height:1.5;margin:0;">Advises on Montessori-aligned milestones, fine motor dexterity, and cooperative play mechanics.</p>
        </div>
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:3px solid #fef08a;border-radius:24px;padding:28px;text-align:center;box-shadow:0 6px 16px rgba(245,158,11,0.06);">
          <div style="width:64px;height:64px;border-radius:50%;background:#fbcfe8;color:#78350f;font-weight:900;font-size:1.3rem;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">HS</div>
          <h3 style="font-size:1.2rem;color:#78350f;font-weight:900;margin:0 0 4px;">Hana Sato</h3>
          <div style="color:#d97706;font-size:0.85rem;font-weight:800;margin-bottom:10px;">Eco-Material & Safety Director</div>
          <p style="color:#92400e;font-size:0.85rem;line-height:1.5;margin:0;">Pioneers non-toxic vegetable finishes and audits European FSC forestry supply chains.</p>
        </div>
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:3px solid #fef08a;border-radius:24px;padding:28px;text-align:center;box-shadow:0 6px 16px rgba(245,158,11,0.06);">
          <div style="width:64px;height:64px;border-radius:50%;background:#fef08a;color:#78350f;font-weight:900;font-size:1.3rem;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">TB</div>
          <h3 style="font-size:1.2rem;color:#78350f;font-weight:900;margin:0 0 4px;">Tobias Brennan</h3>
          <div style="color:#d97706;font-size:0.85rem;font-weight:800;margin-bottom:10px;">Chief Toy Tester & Community Lead</div>
          <p style="color:#92400e;font-size:0.85rem;line-height:1.5;margin:0;">Organizes nursery play-test workshops and coordinates family gift donation programs.</p>
        </div>
      </div>
    </section>
  `;

  const ctaHtml = `
    <section class="wrap" style="padding:60px 0 80px;">
      <div style="background:#78350f;color:#fffdf5;border-radius:28px;padding:48px;text-align:center;box-shadow:0 8px 30px rgba(120,53,15,0.2);">
        <h2 style="font-size:2.2rem;color:#fffdf5;font-weight:900;margin:0 0 14px;">Bring Wholesome Play into Your Home</h2>
        <p style="color:#fed7aa;max-width:580px;margin:0 auto 28px;font-size:1.05rem;">Browse our award-winning wooden puzzles, building sets, and newborn milestone gifts.</p>
        <a class="button" style="background:#f59e0b;color:#ffffff;font-weight:900;border-radius:9999px;padding:16px 36px;box-shadow:0 8px 24px rgba(245,158,11,0.4);display:inline-block;text-decoration:none;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>
          Explore Full Collection ↗
        </a>
      </div>
    </section>
  `;

  return `${heroHtml}${statsHtml}${workshopHtml}${teamHtml}${ctaHtml}`;
}

function renderModernToysAbout(ctx: ThemeContext): string {
  const { draft, ui, path, navAttrs, asset } = ctx;
  const company = draft.company;
  const copy = draft.copy[ctx.lang] ?? {
    about: 'At Juno Toys, we believe childhood is sacred. Every toy we create undergoes rigorous multi-stage safety testing to spark curiosity, motor skills, and joyful family memories.',
  };
  const isZh = (ctx.lang as string) === 'zh';

  const defaultHeadline = isZh
    ? '用天然木材与纯真匠心，守护每一个孩子的童年奇迹'
    : 'Handcrafted Joy & Natural Wonder for Curious Growing Minds';
  const headline = getAboutHeadline(company, defaultHeadline);

  const defaultStory = [
    isZh
      ? `${company.name} 坚信每个孩子的心智成长都值得最温柔的守护。我们精选经 FSC 国际可持续林业认证的欧洲山毛榉与天然木料，摒弃脆弱的化学塑料与刺耳的电子噪音，以极简质朴的北欧设计语言，打造安全环保、启智益智的经典木质玩具。`
      : `At Juno Toys, we believe childhood is sacred. Every toy we create undergoes rigorous multi-stage safety testing to spark curiosity, motor skills, and joyful family memories.`,
    isZh
      ? '每一件玩具均历经 36 道匠心手工打磨抛光，边缘温润如玉，杜绝毛刺与尖锐棱角；所有饰面均萃取自甜菜、姜黄等纯植物天然水性色素，不仅全面通过 ASTM F963 及欧盟 EN71 儿童玩具安全认证，更能经受代际传承的岁月洗礼。'
      : `Every contour is hand-sanded to a velvet-smooth touch, ensuring there are no sharp edges or splinters. Our finishes use food-grade plant oils and organic water-based pigments, making them entirely safe for teething and gentle exploring.`,
  ];
  const storyParas = getAboutStoryParagraphs(company, defaultStory[0]);
  const paras = company.aboutStory ? storyParas : defaultStory;

  const { primary: aboutImg, secondary: secondaryImg } = getAboutImages(ctx, path('templates/juno/about-workshop.jpg'));

  const stats = parseAboutHighlights(company.aboutHighlights, [
    { value: '150K+', num: 150, suffix: 'K+', label: isZh ? '全球微笑家庭的挚爱陪伴' : 'Smiling Families', desc: isZh ? '产品远销全球 35 个国家与地区' : 'Filling nurseries across 35 countries with laughter' },
    { value: '100%', num: 100, suffix: '%', label: isZh ? '零塑料可持续环保纯木材' : 'Plastic-Free Natural Toys', desc: isZh ? 'FSC 认证欧洲天然山毛榉与植物彩漆' : 'Responsibly harvested beechwood and natural dyes' },
    { value: '0', num: 0, label: isZh ? '有害化学物质与重金属残留' : 'Toxic Chemicals & BPA', desc: isZh ? '第三方实验室 ASTM & EN71 全项达标' : 'Zero BPA, phthalates, or lead; independently certified' },
    { value: '14+', num: 14, suffix: '+', label: isZh ? '专注母婴益智玩具研发年限' : 'Years Crafting Wonder', desc: isZh ? '经久耐磨传承数代的传家之作' : 'Designing heirloom-quality wooden play sets' },
  ]);

  return `
    <div class="juno-about-modern" style="background:#fffefb;color:#451a03;font-family:'Quicksand',-apple-system,sans-serif;">
      <!-- Hero Section -->
      <section class="juno-inner-hero" style="background:linear-gradient(135deg,#fef08a 0%,#fed7aa 50%,#fbcfe8 100%);color:#451a03;padding:85px 0 65px;position:relative;overflow:hidden;border-bottom:3px solid #fde047;">
        <div class="wrap" style="max-width:1200px;margin:0 auto;padding:0 24px;position:relative;z-index:2;text-align:center;">
          <div data-reveal="fade-up" style="display:inline-flex;align-items:center;gap:8px;background:#ffffff;border:2px solid #fde047;padding:7px 22px;border-radius:9999px;margin-bottom:24px;box-shadow:0 4px 14px rgba(245,158,11,0.15);">
            <span style="font-size:1.1rem;">🧸</span>
            <span style="font-size:0.84rem;font-weight:900;color:#92400e;letter-spacing:0.06em;text-transform:uppercase;">
              ${isZh ? `天然纯木温润手作 · 始于 ${esc(company.establishedYear || '2012')}` : `THE JUNO WOODEN WORKSHOP · EST. ${esc(company.establishedYear || '2012')}`}
            </span>
          </div>
          <h1 data-reveal="fade-up" style="font-size:clamp(2.4rem, 5.2vw, 4.4rem);line-height:1.1;font-weight:900;letter-spacing:-0.03em;color:#78350f;max-width:920px;margin:0 auto 22px;">
            ${esc(headline)}
          </h1>
          <p data-reveal="fade-up" style="max-width:720px;color:#92400e;font-size:1.2rem;line-height:1.7;margin:0 auto 36px;">
            ${esc(copy.about || (isZh ? '在 Juno Toys，我们深信童年弥足珍贵。每件玩具均甄选天然无毒木材手工精研打磨，通过多国严苛儿童安全检测，启迪无限想象与纯真探索。' : 'At Juno Toys, we believe childhood is sacred. Every toy we create undergoes rigorous multi-stage safety testing to spark curiosity, motor skills, and joyful family memories.'))}
          </p>
          <div data-reveal="fade-up" style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap;align-items:center;">
            <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} class="button" style="background:#f59e0b;color:#ffffff;font-weight:900;border-radius:9999px;padding:16px 36px;box-shadow:0 8px 24px rgba(245,158,11,0.4);font-size:0.92rem;text-decoration:none;display:inline-block;">
              ${isZh ? '探索全线益智启智系列 ↗' : 'Explore Full Collection ↗'}
            </a>
            <a href="${path('contact/index.html')}" ${navAttrs('contact')} class="button" style="background:#ffffff;color:#78350f;border:2px solid #fed7aa;border-radius:9999px;padding:16px 32px;font-weight:900;font-size:0.92rem;text-decoration:none;display:inline-block;">
              ${isZh ? '批发采购与样品检测 →' : 'Wholesale & Custom Samples →'}
            </a>
          </div>
        </div>
      </section>

      <!-- Key Wholesome Metrics -->
      <section class="wrap" style="max-width:1200px;margin:0 auto;padding:48px 24px 32px;">
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px;">
          ${stats.map(s => `
            <div data-reveal="fade-up" class="wr-card-hover" style="background:#ffffff;border:3px solid #fef08a;border-radius:24px;padding:28px 24px;text-align:center;box-shadow:0 6px 18px rgba(245,158,11,0.06);">
              <div style="font-size:clamp(2.4rem, 4vw, 3rem);font-weight:900;color:#f59e0b;letter-spacing:-1px;">
                <span data-counter="${s.num}" ${s.prefix ? `data-prefix="${esc(s.prefix)}"` : ''} ${s.suffix ? `data-suffix="${esc(s.suffix)}"` : ''}>
                  ${esc(s.value)}
                </span>
              </div>
              <div style="font-weight:900;color:#78350f;font-size:1.05rem;margin-top:6px;">
                ${esc(s.label)}
              </div>
              ${s.desc ? `
                <div style="font-size:0.86rem;color:#92400e;margin-top:6px;line-height:1.5;">
                  ${esc(s.desc)}
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </section>

      <!-- Juno Workshop Story & Guarantees -->
      <section class="wrap" style="max-width:1200px;margin:0 auto;padding:50px 24px 70px;">
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:50px;align-items:center;">
          <div data-reveal="fade-up">
            <span style="font-size:0.82rem;font-weight:900;letter-spacing:0.12em;color:#d97706;text-transform:uppercase;">
              ${isZh ? '源自木匠工坊的纯真守护' : 'FROM OUR WOODEN BENCH TO YOUR PLAYROOM'}
            </span>
            <h2 style="font-size:clamp(1.9rem, 3.2vw, 2.6rem);line-height:1.18;color:#78350f;font-weight:900;margin:12px 0 20px;">
              ${isZh ? '守护孩子探索天性，做能传承三代的温暖好玩具' : 'Designed to Nurture Wonder, Not Screens'}
            </h2>
            <div style="color:#92400e;font-size:1.05rem;line-height:1.8;display:flex;flex-direction:column;gap:16px;margin-bottom:28px;">
              ${paras.map(p => `<p style="margin:0;">${esc(p)}</p>`).join('')}
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px;">
              <div style="background:#fffbeb;border:2px solid #fef08a;border-radius:18px;padding:18px;">
                <strong style="color:#78350f;display:block;font-size:1rem;margin-bottom:4px;">
                  🪵 ${isZh ? 'FSC 认证欧洲榉木' : 'FSC Certified Beech'}
                </strong>
                <span style="color:#92400e;font-size:0.85rem;line-height:1.4;display:block;">
                  ${isZh ? '源自受控林区，每采伐一棵树即补种三棵幼苗。' : 'Sustainably managed forests replanting 3 trees for every one harvested.'}
                </span>
              </div>
              <div style="background:#fffbeb;border:2px solid #fef08a;border-radius:18px;padding:18px;">
                <strong style="color:#78350f;display:block;font-size:1rem;margin-bottom:4px;">
                  🎨 ${isZh ? '天然植物彩漆' : 'Natural Plant Pigments'}
                </strong>
                <span style="color:#92400e;font-size:0.85rem;line-height:1.4;display:block;">
                  ${isZh ? '萃取自甜菜、姜黄与螺旋藻，宝宝啃咬全然无忧。' : 'Derived from beetroot, turmeric, and spirulina plant extracts.'}
                </span>
              </div>
            </div>
          </div>

          <div data-reveal="fade-up" style="background:#fffbeb;border:3px solid #fef08a;border-radius:28px;padding:36px;box-shadow:0 8px 24px rgba(245,158,11,0.06);">
            ${aboutImg ? `
              <div style="border-radius:20px;overflow:hidden;border:2px solid #fef08a;margin-bottom:24px;">
                <img src="${esc(aboutImg)}" alt="${esc(company.name)}" style="width:100%;height:220px;object-fit:cover;display:block;" loading="lazy">
              </div>
            ` : ''}
            <h3 style="font-size:1.35rem;font-weight:900;color:#78350f;margin:0 0 20px;">
              ${isZh ? '致父母与孩子们的四大严苛承诺' : 'Our Four Guarantees to Parents'}
            </h3>
            <div style="display:flex;flex-direction:column;gap:18px;">
              <div style="display:flex;gap:14px;align-items:flex-start;">
                <div style="width:32px;height:32px;background:#fde047;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:900;color:#78350f;flex-shrink:0;">1</div>
                <div>
                  <strong style="color:#78350f;font-size:0.95rem;">
                    ${isZh ? '无条件国际儿童安全检测' : 'Unconditional Child Safety'}
                  </strong>
                  <p style="color:#92400e;font-size:0.85rem;line-height:1.5;margin:2px 0 0;">
                    ${isZh ? '全批次历经跌落冲击、吞咽防窒息喉管及重金属迁移检测。' : 'Each batch is sent to third-party labs for choke-tube, impact, and chemical assays.'}
                  </p>
                </div>
              </div>
              <div style="display:flex;gap:14px;align-items:flex-start;">
                <div style="width:32px;height:32px;background:#fde047;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:900;color:#78350f;flex-shrink:0;">2</div>
                <div>
                  <strong style="color:#78350f;font-size:0.95rem;">
                    ${isZh ? '蒙氏开放式益智与空间想象' : 'Open-Ended Play & Discovery'}
                  </strong>
                  <p style="color:#92400e;font-size:0.85rem;line-height:1.5;margin:2px 0 0;">
                    ${isZh ? '不设唯一固定玩法，全方位启发孩子的手眼协调与独立建构思维。' : 'No single "right" way to build—fostering spatial awareness and storytelling.'}
                  </p>
                </div>
              </div>
              <div style="display:flex;gap:14px;align-items:flex-start;">
                <div style="width:32px;height:32px;background:#fde047;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:900;color:#78350f;flex-shrink:0;">3</div>
                <div>
                  <strong style="color:#78350f;font-size:0.95rem;">
                    ${isZh ? '100% 环保塑料零中和包装' : '100% Plastic Neutral Packaging'}
                  </strong>
                  <p style="color:#92400e;font-size:0.85rem;line-height:1.5;margin:2px 0 0;">
                    ${isZh ? '采用环保可回收牛皮纸礼盒配大豆油墨印刷，绿色友善地球。' : 'Recycled kraft gift boxes with soy inks that fold flat for family recycling.'}
                  </p>
                </div>
              </div>
              <div style="display:flex;gap:14px;align-items:flex-start;">
                <div style="width:32px;height:32px;background:#fde047;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:900;color:#78350f;flex-shrink:0;">4</div>
                <div>
                  <strong style="color:#78350f;font-size:0.95rem;">
                    ${isZh ? '代际相传的传家级坚固品质' : 'Generational Heirloom Durability'}
                  </strong>
                  <p style="color:#92400e;font-size:0.85rem;line-height:1.5;margin:2px 0 0;">
                    ${isZh ? '高密度硬木材质历久弥新，多年后仍可作为珍贵回忆赠与下一代。' : 'Engineered so your little one can one day pass their toy on to their own children.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA Banner -->
      <section class="wrap" style="max-width:1200px;margin:0 auto;padding:40px 24px 90px;">
        <div data-reveal="fade-up" style="background:linear-gradient(135deg, #78350f 0%, #92400e 100%);color:#fffdf5;border-radius:28px;padding:52px 32px;text-align:center;box-shadow:0 10px 35px rgba(120,53,15,0.22);">
          <h2 style="font-size:clamp(1.9rem, 3.4vw, 2.6rem);color:#fffdf5;font-weight:900;margin:0 0 16px;">
            ${isZh ? '为您的家庭或幼儿园注入纯真原木欢乐' : 'Bring Wholesome Play into Your Home'}
          </h2>
          <p style="color:#fed7aa;max-width:620px;margin:0 auto 30px;font-size:1.08rem;line-height:1.65;">
            ${isZh ? '浏览荣获国际设计奖项的天然木制拼图、积木建构城堡与初生礼盒系列。' : 'Browse our award-winning wooden puzzles, building sets, and newborn milestone gifts.'}
          </p>
          <a class="button" style="background:#f59e0b;color:#ffffff;font-weight:900;border-radius:9999px;padding:17px 40px;box-shadow:0 8px 24px rgba(245,158,11,0.5);display:inline-block;text-decoration:none;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>
            ${isZh ? '选购当季畅销纯木玩具 ↗' : 'Explore Full Collection ↗'}
          </a>
        </div>
      </section>
    </div>
  `;
}

export function renderToysAbout(ctx: ThemeContext): string {
  if (Boolean(ctx.draft.materials) || isTypedMaterialsSource(ctx.draft)) {
    return renderLegacyToysAbout(ctx);
  }
  return renderModernToysAbout(ctx);
}

export function renderToysContact(ctx: ThemeContext): string {
  const { draft, ui, options } = ctx;
  const company = draft.company;

  const heroHtml = `
    <section class="juno-inner-hero" style="background:linear-gradient(135deg,#fef08a 0%,#fed7aa 50%,#fbcfe8 100%);color:#451a03;padding:80px 0 50px;position:relative;overflow:hidden;border-bottom:3px solid #fde047;">
      <div class="wrap" style="position:relative;z-index:2;text-align:center;">
        <div style="display:inline-flex;align-items:center;gap:8px;background:#ffffff;border:2px solid #fde047;padding:6px 20px;border-radius:9999px;margin-bottom:20px;box-shadow:0 4px 14px rgba(245,158,11,0.12);">
          <span style="font-size:1.1rem;">💌</span>
          <span style="font-size:0.84rem;font-weight:900;color:#92400e;letter-spacing:0.06em;text-transform:uppercase;">JUNO CUSTOMER PLAYCARE</span>
        </div>
        <h1 style="font-size:clamp(2.6rem,5.5vw,4.4rem);line-height:1.08;font-weight:900;letter-spacing:-0.03em;color:#78350f;max-width:880px;margin:0 auto 20px;">
          ${esc(ui.conversation || 'Say Hello to Juno Toys!')}
        </h1>
        <p style="max-width:680px;color:#92400e;font-size:1.2rem;line-height:1.65;margin:0 auto;">
          ${esc(ui.contactIntro || 'Questions about toy safety, custom birthday gift wrapping, or kindergarten wholesale orders? Our friendly team is eager to help!')}
        </p>
      </div>
    </section>
  `;

  const contentHtml = `
    <section class="wrap" style="padding:60px 0 80px;">
      <div style="display:grid;grid-template-columns:1fr 1.2fr;gap:48px;align-items:flex-start;">
        <!-- Left: Customer Care & Workshop -->
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:3px solid #fef08a;border-radius:28px;padding:36px;box-shadow:0 8px 24px rgba(245,158,11,0.06);">
          <span class="eyebrow" style="color:#d97706;font-weight:900;">GET IN TOUCH</span>
          <h3 style="font-size:1.4rem;font-weight:900;color:#78350f;margin:8px 0 24px;">Family Support & Workshop</h3>

          <div style="display:flex;flex-direction:column;gap:20px;font-size:0.95rem;">
            <div>
              <div style="font-size:0.82rem;font-weight:900;color:#d97706;text-transform:uppercase;margin-bottom:4px;">Parent Help Desk Email</div>
              <a style="color:#78350f;font-weight:900;font-size:1.1rem;text-decoration:none;" href="mailto:${esc(company.email)}">${esc(company.email)}</a>
            </div>

            ${company.phone ? `
              <div>
                <div style="font-size:0.82rem;font-weight:900;color:#d97706;text-transform:uppercase;margin-bottom:4px;">Toll-Free Play Line</div>
                <a style="color:#78350f;font-weight:900;text-decoration:none;" href="tel:${esc(company.phone)}">${esc(company.phone)}</a>
              </div>
            ` : ''}

            ${company.whatsapp ? `
              <div>
                <div style="font-size:0.82rem;font-weight:900;color:#d97706;text-transform:uppercase;margin-bottom:4px;">Instant WhatsApp Gifting Advice</div>
                <a style="color:#10b981;font-weight:900;text-decoration:none;" target="_blank" rel="noopener noreferrer" href="https://wa.me/${esc(company.whatsapp.replace(/[^0-9]/g, ''))}">+${esc(company.whatsapp.replace(/[^0-9]/g, ''))} (Chat Now 💬)</a>
              </div>
            ` : ''}

            ${company.address ? `
              <div>
                <div style="font-size:0.82rem;font-weight:900;color:#d97706;text-transform:uppercase;margin-bottom:4px;">Workshop & Showroom Address</div>
                <span style="color:#92400e;line-height:1.5;">${esc(company.address)}</span>
              </div>
            ` : ''}
          </div>

          <div style="margin-top:32px;background:#fffbeb;border:2px solid #fef08a;border-radius:20px;padding:22px;">
            <div style="font-size:0.86rem;color:#78350f;line-height:1.6;">
              <strong>🌈 Support Hours:</strong> Monday – Friday: 9:00 AM – 6:00 PM EST.<br>
              <strong>🎁 Gifting Emergency:</strong> Need a last-minute birthday bundle shipped next-day? Mark your message with "Urgent Birthday" and we prioritize packing!
            </div>
          </div>
        </div>

        <!-- Right: Inquiry Form -->
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:3px solid #fef08a;border-radius:28px;padding:36px;box-shadow:0 8px 24px rgba(245,158,11,0.06);">
          <h2 style="font-size:1.6rem;font-weight:900;color:#78350f;margin:0 0 8px;">Send Us a Note</h2>
          <p style="color:#92400e;font-size:0.95rem;margin:0 0 28px;">Whether you need toy advice or wholesale information, our family team will reply within 24 hours.</p>

          <form id="inquiry" action="${esc(safeUrl(options.inquiryUrl))}" method="post" style="display:grid;grid-template-columns:1fr 1fr;gap:18px;">
            <label style="display:flex;flex-direction:column;gap:6px;color:#78350f;font-size:0.88rem;font-weight:800;">
              <span>${esc(ui.name)} <span style="color:#f59e0b;">*</span></span>
              <input name="name" autocomplete="name" required maxlength="120" style="background:#fffbeb;border:2px solid #fef08a;border-radius:14px;padding:12px 14px;color:#78350f;font:inherit;">
            </label>
            <label style="display:flex;flex-direction:column;gap:6px;color:#78350f;font-size:0.88rem;font-weight:800;">
              <span>${esc(ui.email)} <span style="color:#f59e0b;">*</span></span>
              <input name="email" type="email" autocomplete="email" required maxlength="254" style="background:#fffbeb;border:2px solid #fef08a;border-radius:14px;padding:12px 14px;color:#78350f;font:inherit;">
            </label>
            <label style="grid-column:1/-1;display:flex;flex-direction:column;gap:6px;color:#78350f;font-size:0.88rem;font-weight:800;">
              <span>${esc(ui.company)} (${esc(ui.optional)})</span>
              <input name="company" autocomplete="organization" maxlength="200" placeholder="Daycare, preschool, or store name..." style="background:#fffbeb;border:2px solid #fef08a;border-radius:14px;padding:12px 14px;color:#78350f;font:inherit;">
            </label>
            <label style="grid-column:1/-1;display:flex;flex-direction:column;gap:6px;color:#78350f;font-size:0.88rem;font-weight:800;">
              <span>${esc(ui.product)} (${esc(ui.optional)})</span>
              <select name="productId" style="background:#fffbeb;border:2px solid #fef08a;border-radius:14px;padding:12px 14px;color:#78350f;font:inherit;">
                <option value="">— Select a Toy or Play Set —</option>
                ${draft.products.map(p => `<option value="${esc(p.id)}"${p.id === options.productId ? ' selected' : ''}>${esc(ctx.translateProduct(p).name)}</option>`).join('')}
              </select>
            </label>
            <label style="grid-column:1/-1;display:flex;flex-direction:column;gap:6px;color:#78350f;font-size:0.88rem;font-weight:800;">
              <span>${esc(ui.message)} <span style="color:#f59e0b;">*</span></span>
              <textarea name="message" required maxlength="5000" rows="5" placeholder="Tell us how we can help make play time special..." style="background:#fffbeb;border:2px solid #fef08a;border-radius:14px;padding:12px 14px;color:#78350f;font:inherit;resize:vertical;"></textarea>
            </label>
            <div class="honeypot" aria-hidden="true" style="position:absolute;left:-9999px;">
              <label>Website<input name="website" tabindex="-1" autocomplete="off"></label>
            </div>
            <div style="grid-column:1/-1;">
              <button class="button" type="submit"${options.preview ? ' disabled' : ''} style="background:#f59e0b;color:#ffffff;font-weight:900;border-radius:9999px;border:none;padding:15px 36px;cursor:pointer;font-size:0.92rem;box-shadow:0 6px 20px rgba(245,158,11,0.35);">
                ${esc(ui.send)} ↗
              </button>
            </div>
            <p class="form-status" role="status" aria-live="polite" style="grid-column:1/-1;margin:4px 0 0;font-size:0.9rem;"></p>
          </form>
        </div>
      </div>
    </section>
  `;

  const faqHtml = `
    <section class="wrap" style="padding:40px 0 80px;border-top:2px dashed #fde047;">
      <div style="text-align:center;margin-bottom:40px;">
        <span class="eyebrow" style="color:#d97706;font-weight:900;">COMMON QUESTIONS</span>
        <h2 style="font-size:2.2rem;color:#78350f;font-weight:900;margin:8px 0;">Safety, Shipping & Care FAQ</h2>
      </div>
      <div style="max-width:840px;margin:0 auto;display:flex;flex-direction:column;gap:16px;">
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:2px solid #fef08a;border-radius:20px;padding:24px;">
          <h3 style="color:#78350f;font-size:1.15rem;font-weight:900;margin:0 0 8px;">How should we clean and care for wooden toys?</h3>
          <p style="color:#92400e;font-size:0.92rem;line-height:1.6;margin:0;">Simply wipe gently with a damp cloth and mild soapy water, then air dry. Never submerge wooden toys in water or use harsh chemical disinfectants.</p>
        </div>
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:2px solid #fef08a;border-radius:20px;padding:24px;">
          <h3 style="color:#78350f;font-size:1.15rem;font-weight:900;margin:0 0 8px;">Are the paints safe if my teething baby puts the toy in their mouth?</h3>
          <p style="color:#92400e;font-size:0.92rem;line-height:1.6;margin:0;">Yes, 100%! All our paints are certified non-toxic water-based organic dyes, complying fully with stringent ASTM F963 (US) and EN71 (EU) baby safety mandates.</p>
        </div>
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:2px solid #fef08a;border-radius:20px;padding:24px;">
          <h3 style="color:#78350f;font-size:1.15rem;font-weight:900;margin:0 0 8px;">Do you offer custom engraved birthday or nursery gift messages?</h3>
          <p style="color:#92400e;font-size:0.92rem;line-height:1.6;margin:0;">Yes! Select custom packaging during order inquiry and our workshop will laser-engrave a child's name and include a handwritten seed-paper gift card.</p>
        </div>
      </div>
    </section>
  `;

  return `${heroHtml}${contentHtml}${faqHtml}`;
}

export function renderToysCatalog(ctx: ThemeContext): string {
  const { draft, ui, path, navAttrs, translateProduct, asset } = ctx;

  const heroHtml = `
    <section class="juno-inner-hero" style="background:linear-gradient(135deg,#fef08a 0%,#fed7aa 50%,#fbcfe8 100%);color:#451a03;padding:80px 0 50px;position:relative;overflow:hidden;border-bottom:3px solid #fde047;">
      <div class="wrap" style="position:relative;z-index:2;text-align:center;">
        <div style="display:inline-flex;align-items:center;gap:8px;background:#ffffff;border:2px solid #fde047;padding:6px 20px;border-radius:9999px;margin-bottom:20px;box-shadow:0 4px 14px rgba(245,158,11,0.12);">
          <span style="font-size:1.1rem;">🧩</span>
          <span style="font-size:0.84rem;font-weight:900;color:#92400e;letter-spacing:0.06em;text-transform:uppercase;">FULL PLAYROOM COLLECTION</span>
        </div>
        <h1 style="font-size:clamp(2.6rem,5.5vw,4.4rem);line-height:1.08;font-weight:900;letter-spacing:-0.03em;color:#78350f;max-width:880px;margin:0 auto 20px;">
          ${esc(ui.catalog || 'Explore Joyful Toys & Play Sets')}
        </h1>
        <p style="max-width:680px;color:#92400e;font-size:1.2rem;line-height:1.65;margin:0 auto;">
          Heirloom-grade wooden toys, Montessori developmental play sets, and safe creative games for growing minds.
        </p>
      </div>
    </section>
  `;

  const productsHtml = `
    <section class="wrap" style="padding:60px 0 80px;">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(290px,1fr));gap:28px;">
        ${draft.products.map((p, idx) => {
          const t = translateProduct(p);
          const imgUrl = asset(p.imageAssetId);
          const badges = ['Montessori', 'Baby Safe', 'STEM Play', 'Eco Wood', 'Creative', 'Heirloom'];
          return `
            <article class="product-card wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:3px solid #fef08a;border-radius:24px;padding:24px;display:flex;flex-direction:column;box-shadow:0 8px 20px rgba(245,158,11,0.06);">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
                <span style="font-size:0.75rem;font-weight:900;color:#b45309;background:#fef3c7;padding:4px 12px;border-radius:9999px;">${badges[idx % badges.length]}</span>
                <span style="color:#f59e0b;font-size:0.85rem;">★★★★★</span>
              </div>
              ${imgUrl ? `
                <a href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)} style="display:block;aspect-ratio:16/9;background:#fffbeb;border-radius:18px;margin-bottom:16px;overflow:hidden;">
                  <img src="${esc(imgUrl)}" alt="${esc(t.name)}" style="width:100%;height:100%;object-fit:cover;" loading="lazy">
                </a>
              ` : `
                <div style="background:#fffbeb;border-radius:18px;padding:32px 20px;text-align:center;font-size:2.5rem;margin-bottom:16px;">🧸</div>
              `}
              <h3 style="color:#78350f;margin:0 0 8px;font-size:1.3rem;font-weight:900;">
                <a href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)} style="color:#78350f;text-decoration:none;">
                  ${esc(t.name)}
                </a>
              </h3>
              <p style="color:#92400e;font-size:0.92rem;line-height:1.6;margin:0 0 20px;flex:1;">
                ${esc(t.description || 'Natural developmental toy for joyful creative play.')}
              </p>
              <div style="border-top:2px dashed #fef08a;padding-top:16px;display:flex;align-items:center;justify-content:space-between;margin-top:auto;">
                <span style="font-size:0.85rem;font-weight:900;color:#f59e0b;">ASTM Certified</span>
                <a style="color:#d97706;font-weight:900;font-size:0.9rem;text-decoration:none;" href="${path(`products/${p.id}/index.html`)}" ${navAttrs('detail', p.id)}>
                  ${esc(ui.details || 'View Toy Specs')} →
                </a>
              </div>
            </article>
          `;
        }).join('')}
      </div>
    </section>
  `;

  return `${heroHtml}${productsHtml}`;
}

export function renderToysDetail(ctx: ThemeContext): string {
  const { draft, ui, path, navAttrs, translateProduct, asset, options } = ctx;
  const p = draft.products.find(item => item.id === options.productId) || draft.products[0];
  if (!p) {
    return `<section class="wrap" style="padding:80px 0;"><h1>${esc(ui.noProducts || 'Toy Not Found')}</h1></section>`;
  }

  const t = translateProduct(p);
  const imgUrl = asset(p.imageAssetId);
  const related = draft.products.filter(item => item.id !== p.id).slice(0, 3);
  const waDigits = (draft.company.whatsapp || '').replace(/[^0-9]/g, '');

  return `
    <!-- Top Breadcrumbs & Toy Title -->
    <section class="juno-inner-hero" style="background:linear-gradient(135deg,#fef08a 0%,#fed7aa 50%,#fbcfe8 100%);color:#451a03;padding:50px 0 40px;position:relative;overflow:hidden;border-bottom:3px solid #fde047;">
      <div class="wrap" style="position:relative;z-index:2;">
        <div style="display:flex;align-items:center;gap:8px;font-size:0.88rem;color:#92400e;margin-bottom:16px;font-weight:800;">
          <a href="${path('index.html')}" ${navAttrs('home')} style="color:#92400e;text-decoration:none;">${esc(ui.home)}</a>
          <span>/</span>
          <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="color:#92400e;text-decoration:none;">${esc(ui.catalog)}</a>
          <span>/</span>
          <span style="color:#78350f;">${esc(t.name)}</span>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;">
          <div>
            <div style="display:inline-flex;align-items:center;gap:8px;background:#ffffff;border:2px solid #fde047;padding:4px 14px;border-radius:9999px;font-size:0.8rem;font-weight:900;color:#92400e;margin-bottom:12px;">
              <span>🧸</span> CHILD-SAFE DEVELOPMENTAL TOY
            </div>
            <h1 style="font-size:clamp(2.2rem,4.5vw,3.6rem);line-height:1.1;font-weight:900;letter-spacing:-0.02em;margin:0;color:#78350f;">
              ${esc(t.name)}
            </h1>
          </div>
          <div style="background:#ffffff;border:2px solid #fde047;border-radius:16px;padding:12px 20px;text-align:right;box-shadow:0 4px 12px rgba(245,158,11,0.08);">
            <div style="color:#92400e;font-size:0.8rem;text-transform:uppercase;font-weight:800;">Safety Guarantee</div>
            <div style="color:#d97706;font-weight:900;font-size:1.05rem;">ASTM & EN71 Passed</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Main Showcase: Col 1 Preview & Certifications, Col 2 Specs & Dynamic Progress Bars -->
    <section class="wrap" style="padding:60px 0 40px;">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));gap:48px;align-items:start;">
        <!-- Left Col: Toy Visual -->
        <div>
          <div class="wr-card-hover" style="background:#ffffff;border:3px solid #fef08a;border-radius:28px;padding:32px;text-align:center;box-shadow:0 8px 24px rgba(245,158,11,0.06);">
            ${imgUrl ? `
              <img id="detailMainImg" src="${esc(imgUrl)}" alt="${esc(t.name)}" style="width:100%;max-height:440px;object-fit:contain;border-radius:18px;">
            ` : `
              <div style="background:#fffbeb;border-radius:28px;padding:70px 24px;text-align:center;font-size:5rem;">🧸</div>
            `}
          </div>

          <div style="margin-top:20px;display:flex;gap:10px;flex-wrap:wrap;">
            <span style="background:#fefce8;border:1px solid #fef08a;color:#854d0e;padding:8px 14px;border-radius:999px;font-size:0.85rem;font-weight:800;">✨ Zero BPA or Phthalates</span>
            <span style="background:#fefce8;border:1px solid #fef08a;color:#854d0e;padding:8px 14px;border-radius:999px;font-size:0.85rem;font-weight:800;">🌱 Organic Water Dyes</span>
            <span style="background:#fefce8;border:1px solid #fef08a;color:#854d0e;padding:8px 14px;border-radius:999px;font-size:0.85rem;font-weight:800;">💧 Washable & Durable</span>
          </div>
        </div>

        <!-- Right Col: Narrative, Dynamic Safety Progress Bars, Specifications -->
        <div>
          <h2 style="color:#78350f;font-size:1.8rem;font-weight:900;margin:0 0 16px;">Sensory Comfort & Child Development</h2>
          <p style="font-size:1.15rem;line-height:1.75;color:#92400e;margin:0 0 28px;">
            ${esc(t.description || 'Delightful non-toxic developmental toy engineered with velvety tactile softness, gentle slow memory rise, and certified drop durability for everyday playful adventures.')}
          </p>

          <!-- Dynamic Toy Safety & Material Progress Bars -->
          <div style="background:#fffbeb;border:2px solid #fef08a;border-radius:20px;padding:26px;margin-bottom:28px;">
            <h3 style="color:#78350f;font-size:1.05rem;font-weight:900;margin:0 0 18px;display:flex;align-items:center;gap:8px;">
              <span>🧸</span> Certified Safety & Sensory Benchmarks
            </h3>
            <div style="display:flex;flex-direction:column;gap:18px;">
              <div>
                <div style="display:flex;justify-content:space-between;font-size:0.9rem;font-weight:800;color:#78350f;margin-bottom:6px;">
                  <span>Food-Grade Safety Standard (EN71 / ASTM)</span>
                  <span style="color:#16a34a;">100% Certified Pass</span>
                </div>
                <div class="wr-progress-container" style="background:#fef3c7;height:8px;border-radius:99px;overflow:hidden;">
                  <div class="wr-progress-bar" data-progress="100" style="background:linear-gradient(90deg,#16a34a,#22c55e);height:100%;border-radius:99px;"></div>
                </div>
              </div>
              <div>
                <div style="display:flex;justify-content:space-between;font-size:0.9rem;font-weight:800;color:#78350f;margin-bottom:6px;">
                  <span>5-Second Memory Rise Profile</span>
                  <span style="color:#d97706;">98% Rebound Uniformity</span>
                </div>
                <div class="wr-progress-container" style="background:#fef3c7;height:8px;border-radius:99px;overflow:hidden;">
                  <div class="wr-progress-bar" data-progress="98" style="background:linear-gradient(90deg,#f59e0b,#fbbf24);height:100%;border-radius:99px;"></div>
                </div>
              </div>
              <div>
                <div style="display:flex;justify-content:space-between;font-size:0.9rem;font-weight:800;color:#78350f;margin-bottom:6px;">
                  <span>Drop & Stretch Resilience</span>
                  <span style="color:#ea580c;">96% Tear Durability</span>
                </div>
                <div class="wr-progress-container" style="background:#fef3c7;height:8px;border-radius:99px;overflow:hidden;">
                  <div class="wr-progress-bar" data-progress="96" style="background:linear-gradient(90deg,#ea580c,#f97316);height:100%;border-radius:99px;"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Toy Specifications Table -->
          <div style="background:#ffffff;border:3px solid #fef08a;border-radius:20px;padding:24px;margin-bottom:32px;box-shadow:0 4px 14px rgba(245,158,11,0.04);">
            <h3 style="color:#78350f;font-size:1.05rem;font-weight:900;margin:0 0 16px;">Toy Details & Materials</h3>
            <div style="display:flex;flex-direction:column;gap:12px;font-size:0.92rem;">
              <div style="display:flex;justify-content:space-between;padding-bottom:10px;border-bottom:1px dashed #fde047;">
                <span style="color:#92400e;">Natural Materials</span>
                <strong style="color:#78350f;">${esc(p.material || 'Ultra-Soft Elastic Foam / Eco-Polymer')}</strong>
              </div>
              <div style="display:flex;justify-content:space-between;padding-bottom:10px;border-bottom:1px dashed #fde047;">
                <span style="color:#92400e;">Toy Dimensions</span>
                <strong style="color:#78350f;">${esc(p.dimensions || '120mm x 85mm (Comfort Handheld)')}</strong>
              </div>
              <div style="display:flex;justify-content:space-between;padding-bottom:10px;border-bottom:1px dashed #fde047;">
                <span style="color:#92400e;">Age Recommendation</span>
                <strong style="color:#d97706;">Ages 3+ & All Sensory Play Lovers</strong>
              </div>
              <div style="display:flex;justify-content:space-between;">
                <span style="color:#92400e;">Safety Certifications</span>
                <strong style="color:#16a34a;">ASTM F963, EN71, CPSIA Verified</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 3 Child Development Pillars -->
    <section class="wrap" style="padding:20px 0 60px;">
      <div style="text-align:center;max-width:720px;margin:0 auto 40px;" data-reveal="fade-up">
        <span style="color:#d97706;font-size:0.85rem;font-weight:900;letter-spacing:0.06em;text-transform:uppercase;">DEVELOPMENTAL BENEFITS</span>
        <h2 style="font-size:clamp(1.8rem,3vw,2.4rem);color:#78350f;font-weight:900;margin:8px 0 12px;">Crafted for Growth and Smiles</h2>
        <p style="color:#92400e;font-size:1.05rem;line-height:1.6;margin:0;">Carefully balanced sensory resistance to help children self-soothe and build finger coordination.</p>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px;">
        <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:3px solid #fef08a;border-radius:24px;padding:32px;box-shadow:0 6px 18px rgba(245,158,11,0.06);text-align:center;">
          <div style="font-size:2.8rem;margin-bottom:16px;">🖐️</div>
          <h3 style="color:#78350f;font-size:1.2rem;font-weight:900;margin:0 0 10px;">Fine Motor Skills</h3>
          <p style="color:#92400e;font-size:0.95rem;line-height:1.6;margin:0;">Gentle tactile resistance strengthens tiny fingers and improves grip control essential for early handwriting.</p>
        </div>

        <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:3px solid #fef08a;border-radius:24px;padding:32px;box-shadow:0 6px 18px rgba(245,158,11,0.06);text-align:center;">
          <div style="font-size:2.8rem;margin-bottom:16px;">🌱</div>
          <h3 style="color:#78350f;font-size:1.2rem;font-weight:900;margin:0 0 10px;">100% Non-Toxic & Safe</h3>
          <p style="color:#92400e;font-size:0.95rem;line-height:1.6;margin:0;">Made purely with food-grade compliant colorants and zero volatile organic compounds for complete peace of mind.</p>
        </div>

        <div class="wr-card-hover" data-reveal="fade-up" style="background:#ffffff;border:3px solid #fef08a;border-radius:24px;padding:32px;box-shadow:0 6px 18px rgba(245,158,11,0.06);text-align:center;">
          <div style="font-size:2.8rem;margin-bottom:16px;">🧸</div>
          <h3 style="color:#78350f;font-size:1.2rem;font-weight:900;margin:0 0 10px;">Sensory Calming</h3>
          <p style="color:#92400e;font-size:0.95rem;line-height:1.6;margin:0;">Rhythmic squeezing creates immediate deep tactile feedback, naturally lowering sensory overload and anxiety.</p>
        </div>
      </div>
    </section>

    <!-- Wholesale & Gift Bundle Inquiry Form -->
    <section class="wrap" style="padding:20px 0 60px;">
      <div style="background:linear-gradient(135deg,#fef08a 0%,#fed7aa 100%);color:#451a03;border-radius:28px;padding:40px;display:grid;grid-template-columns:1fr 1.2fr;gap:40px;align-items:start;">
        <div>
          <span style="color:#92400e;font-size:0.85rem;font-weight:900;text-transform:uppercase;">ORDER & WHOLESALE</span>
          <h2 style="color:#78350f;font-size:1.8rem;font-weight:900;margin:8px 0 12px;">Order ${esc(t.name)}</h2>
          <p style="color:#92400e;font-size:1rem;line-height:1.6;margin:0 0 24px;">
            Whether you are ordering custom gift sets, boutique retail bundles, or sample packs, let us know your requirements.
          </p>
          <div style="display:flex;flex-direction:column;gap:12px;font-size:0.9rem;color:#78350f;">
            <div style="display:flex;align-items:center;gap:10px;">
              <span>✓</span> Fast Worldwide Air Express Dispatch
            </div>
            <div style="display:flex;align-items:center;gap:10px;">
              <span>✓</span> Custom Retail Packaging & Hangtag Options
            </div>
            <div style="display:flex;align-items:center;gap:10px;">
              <span>✓</span> Low Minimum Order Quantity (MOQ) for Boutiques
            </div>
          </div>
          ${waDigits ? `
            <div style="margin-top:28px;">
              <a href="https://wa.me/${esc(waDigits)}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:8px;background:#25d366;color:#ffffff;font-weight:800;padding:12px 24px;border-radius:9999px;text-decoration:none;font-size:0.95rem;box-shadow:0 4px 14px rgba(37,211,102,0.3);">
                <span>WhatsApp Toy Concierge ↗</span>
              </a>
            </div>
          ` : ''}
        </div>

        <div>
          <form id="inquiry" action="${esc(safeUrl(options.inquiryUrl))}" method="post" style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
            <div style="grid-column:1 / -1;display:flex;flex-direction:column;gap:6px;">
              <label style="color:#78350f;font-size:0.85rem;font-weight:800;">Selected Toy Style</label>
              <input name="productName" value="${esc(t.name)}" readonly style="background:#ffffff;border:2px solid #fde047;border-radius:12px;padding:10px 14px;color:#78350f;font:inherit;font-weight:800;">
              <input type="hidden" name="productId" value="${esc(p.id)}">
            </div>
            <div style="display:flex;flex-direction:column;gap:6px;">
              <label style="color:#78350f;font-size:0.85rem;font-weight:800;">${esc(ui.name)} <span style="color:#d97706;">*</span></label>
              <input name="name" required placeholder="Your name" style="background:#ffffff;border:2px solid #fed7aa;border-radius:12px;padding:10px 14px;color:#78350f;font:inherit;">
            </div>
            <div style="display:flex;flex-direction:column;gap:6px;">
              <label style="color:#78350f;font-size:0.85rem;font-weight:800;">${esc(ui.email)} <span style="color:#d97706;">*</span></label>
              <input name="email" type="email" required placeholder="name@email.com" style="background:#ffffff;border:2px solid #fed7aa;border-radius:12px;padding:10px 14px;color:#78350f;font:inherit;">
            </div>
            <div style="display:flex;flex-direction:column;gap:6px;">
              <label style="color:#78350f;font-size:0.85rem;font-weight:800;">Company / Store <span style="color:#d97706;">*</span></label>
              <input name="company" required placeholder="Store or company name" style="background:#ffffff;border:2px solid #fed7aa;border-radius:12px;padding:10px 14px;color:#78350f;font:inherit;">
            </div>
            <div style="display:flex;flex-direction:column;gap:6px;">
              <label style="color:#78350f;font-size:0.85rem;font-weight:800;">Estimated Quantity</label>
              <input name="quantity" placeholder="e.g. 500 pcs or sample pack" style="background:#ffffff;border:2px solid #fed7aa;border-radius:12px;padding:10px 14px;color:#78350f;font:inherit;">
            </div>
            <div style="grid-column:1 / -1;display:flex;flex-direction:column;gap:6px;">
              <label style="color:#78350f;font-size:0.85rem;font-weight:800;">Your Message / Packaging Requests</label>
              <textarea name="message" rows="3" placeholder="Tell us if you need custom display boxes, barcode labeling, or sample testing..." style="background:#ffffff;border:2px solid #fed7aa;border-radius:12px;padding:10px 14px;color:#78350f;font:inherit;resize:vertical;"></textarea>
            </div>
            <div style="grid-column:1 / -1;margin-top:6px;">
              <button type="submit" class="button" style="width:100%;background:#f59e0b;color:#ffffff;font-weight:900;border-radius:9999px;padding:14px;font-size:1rem;border:none;cursor:pointer;box-shadow:0 6px 18px rgba(245,158,11,0.4);">
                ${esc(ui.inquire || 'Send Wholesale & Sample Inquiry')} ↗
              </button>
              <p class="form-status" role="status" aria-live="polite" style="margin:10px 0 0;font-size:0.85rem;text-align:center;color:#92400e;"></p>
            </div>
          </form>
        </div>
      </div>
    </section>

    <!-- Related Toy Collections -->
    ${related.length > 0 ? `
      <section class="wrap" style="padding:20px 0 80px;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:28px;">
          <h2 style="font-size:1.6rem;color:#78350f;font-weight:900;margin:0;">More Cherished Toys to Explore</h2>
          <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="color:#d97706;font-weight:800;text-decoration:none;font-size:0.95rem;">
            ${esc(ui.allProducts)} ↗
          </a>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:24px;">
          ${related.map(item => {
            const it = translateProduct(item);
            const itemImg = asset(item.imageAssetId);
            return `
              <div class="wr-card-hover" style="background:#ffffff;border:3px solid #fef08a;border-radius:24px;padding:20px;display:flex;flex-direction:column;box-shadow:0 4px 14px rgba(245,158,11,0.06);">
                ${itemImg ? `
                  <a href="${path(`products/${item.id}/index.html`)}" ${navAttrs('detail', item.id)} style="display:block;aspect-ratio:16/9;background:#fffbeb;border-radius:16px;overflow:hidden;margin-bottom:14px;">
                    <img src="${esc(itemImg)}" alt="${esc(it.name)}" style="width:100%;height:100%;object-fit:contain;">
                  </a>
                ` : `
                  <div style="padding:28px;text-align:center;font-size:2.5rem;background:#fffbeb;border-radius:16px;margin-bottom:14px;">🧸</div>
                `}
                <div style="padding:4px;display:flex;flex-direction:column;flex:1;">
                  <h4 style="font-size:1.1rem;font-weight:900;color:#78350f;margin:0 0 8px;">
                    <a href="${path(`products/${item.id}/index.html`)}" ${navAttrs('detail', item.id)} style="color:#78350f;text-decoration:none;">
                      ${esc(it.name)}
                    </a>
                  </h4>
                  <p style="color:#92400e;font-size:0.88rem;line-height:1.5;margin:0 0 16px;flex:1;">
                    ${esc(it.description || 'Natural developmental sensory children toy.')}
                  </p>
                  <a href="${path(`products/${item.id}/index.html`)}" ${navAttrs('detail', item.id)} style="color:#f59e0b;font-weight:900;font-size:0.88rem;text-decoration:none;margin-top:auto;">
                    ${esc(ui.details)} →
                  </a>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </section>
    ` : ''}
  `;
}

