import { esc, safeUrl, type ThemeContext } from './types';

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
        <div style="display:inline-flex;align-items:center;gap:8px;background:#ffffff;border:2px solid #fde047;padding:8px 22px;border-radius:9999px;margin-bottom:24px;box-shadow:0 4px 14px rgba(245,158,11,0.15);">
          <span style="font-size:1.1rem;">🧸</span>
          <span style="font-size:0.84rem;font-weight:900;color:#92400e;letter-spacing:0.06em;text-transform:uppercase;">SUSTAINABLE PLAY · JUNO TOYS COLLECTION</span>
        </div>
        <h1 class="hero-title" style="font-size:clamp(2.8rem, 5.8vw, 4.8rem);line-height:1.08;font-weight:900;letter-spacing:-0.03em;color:#78350f;max-width:900px;margin:0 auto 20px;text-align:center;">
          ${esc(copy.headline)}
        </h1>
        <p style="max-width:680px;color:#92400e;font-size:1.22rem;line-height:1.65;margin:0 auto 36px;text-align:center;">
          ${esc(copy.subtitle)}
        </p>
        <div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap;">
          <a class="button" style="background:#f59e0b;color:#ffffff;font-weight:900;border-radius:9999px;padding:16px 36px;box-shadow:0 8px 24px rgba(245,158,11,0.4);font-size:0.92rem;" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>
            ${esc(copy.cta || 'Shop Bestsellers')} ↗
          </a>
          <a class="button" style="background:#ffffff;color:#78350f;border:2px solid #fed7aa;border-radius:9999px;padding:16px 32px;font-weight:800;font-size:0.92rem;" href="${path('contact/index.html')}" ${navAttrs('contact')}>
            Order Custom Gift Bundle →
          </a>
        </div>

        <div style="margin-top:42px;display:flex;gap:28px;justify-content:center;flex-wrap:wrap;color:#92400e;font-size:0.9rem;font-weight:700;">
          <div>✨ Non-Toxic Natural Dyes</div>
          <div>🪵 FSC-Certified Beechwood</div>
          <div>❤️ Loved by 150,000+ Happy Families</div>
        </div>
      </div>
    </section>
  `;

  // 3. Safety & Material Guarantees
  const safetyHtml = `
    <section class="wrap" style="padding:48px 0 32px;">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px;">
        <div style="background:#ffffff;border:3px solid #fef08a;border-radius:20px;padding:26px;text-align:center;box-shadow:0 6px 16px rgba(245,158,11,0.08);">
          <div style="font-size:2.5rem;margin-bottom:8px;">🌱</div>
          <div style="font-weight:900;color:#78350f;font-size:1.1rem;">100% Non-Toxic</div>
          <div style="font-size:0.86rem;color:#92400e;margin-top:6px;line-height:1.5;">Food-grade water-based lacquers and natural vegetable dyes safe for teething babies.</div>
        </div>
        <div style="background:#ffffff;border:3px solid #fef08a;border-radius:20px;padding:26px;text-align:center;box-shadow:0 6px 16px rgba(245,158,11,0.08);">
          <div style="font-size:2.5rem;margin-bottom:8px;">🪵</div>
          <div style="font-weight:900;color:#78350f;font-size:1.1rem;">FSC-Certified Wood</div>
          <div style="font-size:0.86rem;color:#92400e;margin-top:6px;line-height:1.5;">Responsibly harvested European beech and maple that will last for generations.</div>
        </div>
        <div style="background:#ffffff;border:3px solid #fef08a;border-radius:20px;padding:26px;text-align:center;box-shadow:0 6px 16px rgba(245,158,11,0.08);">
          <div style="font-size:2.5rem;margin-bottom:8px;">🛡️</div>
          <div style="font-weight:900;color:#78350f;font-size:1.1rem;">ASTM & EN71 Tested</div>
          <div style="font-size:0.86rem;color:#92400e;margin-top:6px;line-height:1.5;">Independently certified by global laboratory testing for drop, choke, and chemical safety.</div>
        </div>
        <div style="background:#ffffff;border:3px solid #fef08a;border-radius:20px;padding:26px;text-align:center;box-shadow:0 6px 16px rgba(245,158,11,0.08);">
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
            <article class="product-card" style="background:#ffffff;border:3px solid #fef08a;border-radius:24px;padding:24px;display:flex;flex-direction:column;justify-content:space-between;box-shadow:0 8px 20px rgba(245,158,11,0.08);">
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
        <div style="background:#fffbeb;border:2px solid #fef08a;border-radius:20px;padding:24px;text-align:center;">
          <div style="font-size:2.8rem;margin-bottom:8px;">👶</div>
          <h4 style="color:#78350f;font-weight:900;margin:0 0 6px;font-size:1.15rem;">Baby & Toddler</h4>
          <div style="font-size:0.85rem;color:#92400e;">Teethers, grasping rattles & sensory play mats (0-2 Yrs)</div>
        </div>
        <div style="background:#fffbeb;border:2px solid #fef08a;border-radius:20px;padding:24px;text-align:center;">
          <div style="font-size:2.8rem;margin-bottom:8px;">🎨</div>
          <h4 style="color:#78350f;font-weight:900;margin:0 0 6px;font-size:1.15rem;">Preschool Creators</h4>
          <div style="font-size:0.85rem;color:#92400e;">Pretend kitchens, stacking blocks & wooden train tracks (3-5 Yrs)</div>
        </div>
        <div style="background:#fffbeb;border:2px solid #fef08a;border-radius:20px;padding:24px;text-align:center;">
          <div style="font-size:2.8rem;margin-bottom:8px;">🔬</div>
          <h4 style="color:#78350f;font-weight:900;margin:0 0 6px;font-size:1.15rem;">STEM & Building</h4>
          <div style="font-size:0.85rem;color:#92400e;">Magnetic construction sets, science kits & gears (6-8 Yrs)</div>
        </div>
        <div style="background:#fffbeb;border:2px solid #fef08a;border-radius:20px;padding:24px;text-align:center;">
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
        <div style="background:#ffffff;border:2px solid #fef08a;border-radius:20px;padding:28px;box-shadow:0 4px 14px rgba(245,158,11,0.06);">
          <div style="color:#f59e0b;font-size:1rem;margin-bottom:12px;">★★★★★</div>
          <p style="color:#78350f;line-height:1.7;font-size:0.95rem;margin:0 0 18px;">"The quality of the wooden train set is incredible. My 3-year-old hasn't stopped playing with it for three months straight!"</p>
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:40px;height:40px;border-radius:50%;background:#fde047;color:#78350f;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:0.9rem;">ES</div>
            <div><div style="font-weight:900;color:#78350f;font-size:0.9rem;">Emily Simmons</div><div style="color:#92400e;font-size:0.8rem;">Mom of two, Seattle WA</div></div>
          </div>
        </div>
        <div style="background:#ffffff;border:2px solid #fef08a;border-radius:20px;padding:28px;box-shadow:0 4px 14px rgba(245,158,11,0.06);">
          <div style="color:#f59e0b;font-size:1rem;margin-bottom:12px;">★★★★★</div>
          <p style="color:#78350f;line-height:1.7;font-size:0.95rem;margin:0 0 18px;">"Knowing every edge is smooth and all the paints are completely non-toxic gives me so much peace of mind."</p>
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:40px;height:40px;border-radius:50%;background:#fed7aa;color:#78350f;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:0.9rem;">JT</div>
            <div><div style="font-weight:900;color:#78350f;font-size:0.9rem;">Jonathan Taylor</div><div style="color:#92400e;font-size:0.8rem;">Father of toddler, Austin TX</div></div>
          </div>
        </div>
        <div style="background:#ffffff;border:2px solid #fef08a;border-radius:20px;padding:28px;box-shadow:0 4px 14px rgba(245,158,11,0.06);">
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
      <div class="wrap" style="display:flex;justify-content:space-between;align-items:center;gap:40px;flex-wrap:wrap;">
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

export function renderToysAbout(ctx: ThemeContext): string {
  const { draft, ui, path, navAttrs } = ctx;
  const copy = draft.copy[ctx.lang] ?? {
    about: 'At Juno Toys, we believe childhood is sacred. Every toy we create undergoes rigorous multi-stage safety testing to spark curiosity, motor skills, and joyful family memories.',
  };

  const heroHtml = `
    <section class="juno-inner-hero" style="background:linear-gradient(135deg,#fef08a 0%,#fed7aa 50%,#fbcfe8 100%);color:#451a03;padding:80px 0 60px;position:relative;overflow:hidden;border-bottom:3px solid #fde047;">
      <div class="wrap" style="position:relative;z-index:2;text-align:center;">
        <div style="display:inline-flex;align-items:center;gap:8px;background:#ffffff;border:2px solid #fde047;padding:6px 20px;border-radius:9999px;margin-bottom:20px;box-shadow:0 4px 14px rgba(245,158,11,0.12);">
          <span style="font-size:1.1rem;">🧸</span>
          <span style="font-size:0.84rem;font-weight:900;color:#92400e;letter-spacing:0.06em;text-transform:uppercase;">THE JUNO WORKSHOP STORY</span>
        </div>
        <h1 style="font-size:clamp(2.6rem,5.5vw,4.4rem);line-height:1.08;font-weight:900;letter-spacing:-0.03em;color:#78350f;max-width:880px;margin:0 auto 20px;">
          Handcrafted Joy for Curious Minds
        </h1>
        <p style="max-width:680px;color:#92400e;font-size:1.2rem;line-height:1.65;margin:0 auto;">
          ${esc(copy.about)}
        </p>
      </div>
    </section>
  `;

  const statsHtml = `
    <section class="wrap" style="padding:50px 0 30px;">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px;">
        <div style="background:#ffffff;border:3px solid #fef08a;border-radius:24px;padding:26px;text-align:center;box-shadow:0 6px 16px rgba(245,158,11,0.06);">
          <div style="font-size:2.8rem;font-weight:900;color:#f59e0b;">150K+</div>
          <div style="font-weight:900;color:#78350f;font-size:1.05rem;margin-top:4px;">Smiling Families</div>
          <div style="font-size:0.85rem;color:#92400e;margin-top:4px;line-height:1.5;">Filling living rooms and nurseries across 35 countries with laughter.</div>
        </div>
        <div style="background:#ffffff;border:3px solid #fef08a;border-radius:24px;padding:26px;text-align:center;box-shadow:0 6px 16px rgba(245,158,11,0.06);">
          <div style="font-size:2.8rem;font-weight:900;color:#f59e0b;">100%</div>
          <div style="font-weight:900;color:#78350f;font-size:1.05rem;margin-top:4px;">Plastic-Free Natural Toys</div>
          <div style="font-size:0.85rem;color:#92400e;margin-top:4px;line-height:1.5;">Responsibly harvested FSC European beech, organic cotton, and vegetable dyes.</div>
        </div>
        <div style="background:#ffffff;border:3px solid #fef08a;border-radius:24px;padding:26px;text-align:center;box-shadow:0 6px 16px rgba(245,158,11,0.06);">
          <div style="font-size:2.8rem;font-weight:900;color:#f59e0b;">0</div>
          <div style="font-weight:900;color:#78350f;font-size:1.05rem;margin-top:4px;">Toxic Chemicals</div>
          <div style="font-size:0.85rem;color:#92400e;margin-top:4px;line-height:1.5;">Zero BPA, zero phthalates, zero lead. Independently lab-tested to ASTM & EN71.</div>
        </div>
        <div style="background:#ffffff;border:3px solid #fef08a;border-radius:24px;padding:26px;text-align:center;box-shadow:0 6px 16px rgba(245,158,11,0.06);">
          <div style="font-size:2.8rem;font-weight:900;color:#f59e0b;">14 Yrs</div>
          <div style="font-weight:900;color:#78350f;font-size:1.05rem;margin-top:4px;">Dedicated Craftsmanship</div>
          <div style="font-size:0.85rem;color:#92400e;margin-top:4px;line-height:1.5;">Designing heirloom-quality wooden play sets that siblings pass down.</div>
        </div>
      </div>
    </section>
  `;

  const workshopHtml = `
    <section class="wrap" style="padding:50px 0 70px;">
      <div style="display:grid;grid-template-columns:1.1fr 1fr;gap:48px;align-items:center;">
        <div>
          <span class="eyebrow" style="color:#d97706;font-weight:900;">FROM OUR WOODEN BENCH TO YOUR PLAYROOM</span>
          <h2 style="font-size:2.4rem;line-height:1.15;color:#78350f;font-weight:900;margin:10px 0 20px;">
            Designed to Nurture Wonder, Not Screens
          </h2>
          <p style="color:#92400e;font-size:1.05rem;line-height:1.75;margin-bottom:20px;">
            Juno Toys was born in a modest Scandinavian woodworking studio with a simple wooden rocking horse made for a newborn daughter. Frustrated by disposable plastic toys with harsh sounds and fragile hinges, we resolved to return to heirloom craftsmanship.
          </p>
          <p style="color:#92400e;font-size:1.05rem;line-height:1.75;margin:0 0 28px;">
            Every contour is hand-sanded to a velvet-smooth touch, ensuring there are no sharp edges or splinters. Our finishes use food-grade plant oils and organic water-based pigments, making them entirely safe for teething and gentle exploring.
          </p>
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

        <div style="background:#fffbeb;border:3px solid #fef08a;border-radius:28px;padding:36px;box-shadow:0 8px 24px rgba(245,158,11,0.06);">
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
        <div style="background:#ffffff;border:3px solid #fef08a;border-radius:24px;padding:28px;text-align:center;box-shadow:0 6px 16px rgba(245,158,11,0.06);">
          <div style="width:64px;height:64px;border-radius:50%;background:#fde047;color:#78350f;font-weight:900;font-size:1.3rem;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">CL</div>
          <h3 style="font-size:1.2rem;color:#78350f;font-weight:900;margin:0 0 4px;">Clara Lindqvist</h3>
          <div style="color:#d97706;font-size:0.85rem;font-weight:800;margin-bottom:10px;">Founder & Master Toymaker</div>
          <p style="color:#92400e;font-size:0.85rem;line-height:1.5;margin:0;">Passionate woodturner and mother of three with 16 years designing sensory developmental toys.</p>
        </div>
        <div style="background:#ffffff;border:3px solid #fef08a;border-radius:24px;padding:28px;text-align:center;box-shadow:0 6px 16px rgba(245,158,11,0.06);">
          <div style="width:64px;height:64px;border-radius:50%;background:#fed7aa;color:#78350f;font-weight:900;font-size:1.3rem;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">JS</div>
          <h3 style="font-size:1.2rem;color:#78350f;font-weight:900;margin:0 0 4px;">Dr. Julian Sterling</h3>
          <div style="color:#d97706;font-size:0.85rem;font-weight:800;margin-bottom:10px;">Child Development Psychologist</div>
          <p style="color:#92400e;font-size:0.85rem;line-height:1.5;margin:0;">Advises on Montessori-aligned milestones, fine motor dexterity, and cooperative play mechanics.</p>
        </div>
        <div style="background:#ffffff;border:3px solid #fef08a;border-radius:24px;padding:28px;text-align:center;box-shadow:0 6px 16px rgba(245,158,11,0.06);">
          <div style="width:64px;height:64px;border-radius:50%;background:#fbcfe8;color:#78350f;font-weight:900;font-size:1.3rem;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">HS</div>
          <h3 style="font-size:1.2rem;color:#78350f;font-weight:900;margin:0 0 4px;">Hana Sato</h3>
          <div style="color:#d97706;font-size:0.85rem;font-weight:800;margin-bottom:10px;">Eco-Material & Safety Director</div>
          <p style="color:#92400e;font-size:0.85rem;line-height:1.5;margin:0;">Pioneers non-toxic vegetable finishes and audits European FSC forestry supply chains.</p>
        </div>
        <div style="background:#ffffff;border:3px solid #fef08a;border-radius:24px;padding:28px;text-align:center;box-shadow:0 6px 16px rgba(245,158,11,0.06);">
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
        <div style="background:#ffffff;border:3px solid #fef08a;border-radius:28px;padding:36px;box-shadow:0 8px 24px rgba(245,158,11,0.06);">
          <span class="eyebrow" style="color:#d97706;font-weight:900;">DIRECT DESK</span>
          <h3 style="font-size:1.35rem;font-weight:900;color:#78350f;margin:8px 0 24px;">Playroom Support & Workshop</h3>

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
        <div style="background:#ffffff;border:3px solid #fef08a;border-radius:28px;padding:36px;box-shadow:0 8px 24px rgba(245,158,11,0.06);">
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
        <div style="background:#ffffff;border:2px solid #fef08a;border-radius:20px;padding:24px;">
          <h3 style="color:#78350f;font-size:1.15rem;font-weight:900;margin:0 0 8px;">How should we clean and care for wooden toys?</h3>
          <p style="color:#92400e;font-size:0.92rem;line-height:1.6;margin:0;">Simply wipe gently with a damp cloth and mild soapy water, then air dry. Never submerge wooden toys in water or use harsh chemical disinfectants.</p>
        </div>
        <div style="background:#ffffff;border:2px solid #fef08a;border-radius:20px;padding:24px;">
          <h3 style="color:#78350f;font-size:1.15rem;font-weight:900;margin:0 0 8px;">Are the paints safe if my teething baby puts the toy in their mouth?</h3>
          <p style="color:#92400e;font-size:0.92rem;line-height:1.6;margin:0;">Yes, 100%! All our paints are certified non-toxic water-based organic dyes, complying fully with stringent ASTM F963 (US) and EN71 (EU) baby safety mandates.</p>
        </div>
        <div style="background:#ffffff;border:2px solid #fef08a;border-radius:20px;padding:24px;">
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
            <article style="background:#ffffff;border:3px solid #fef08a;border-radius:24px;padding:24px;display:flex;flex-direction:column;box-shadow:0 8px 20px rgba(245,158,11,0.06);">
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

  return `
    <section class="juno-inner-hero" style="background:linear-gradient(135deg,#fef08a 0%,#fed7aa 50%,#fbcfe8 100%);color:#451a03;padding:50px 0 40px;position:relative;overflow:hidden;border-bottom:3px solid #fde047;">
      <div class="wrap" style="position:relative;z-index:2;">
        <div style="display:flex;align-items:center;gap:8px;font-size:0.88rem;color:#92400e;margin-bottom:16px;font-weight:800;">
          <a href="${path('index.html')}" ${navAttrs('home')} style="color:#92400e;text-decoration:none;">${esc(ui.home)}</a>
          <span>/</span>
          <a href="${path('catalog/index.html')}" ${navAttrs('catalog')} style="color:#92400e;text-decoration:none;">${esc(ui.catalog)}</a>
          <span>/</span>
          <span style="color:#78350f;">${esc(t.name)}</span>
        </div>
        <h1 style="font-size:clamp(2.2rem,4.5vw,3.6rem);line-height:1.1;font-weight:900;letter-spacing:-0.02em;margin:0;color:#78350f;">
          ${esc(t.name)}
        </h1>
      </div>
    </section>

    <section class="wrap" style="padding:60px 0 80px;">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:flex-start;">
        <div>
          ${imgUrl ? `
            <div style="background:#ffffff;border:3px solid #fef08a;border-radius:28px;padding:24px;text-align:center;box-shadow:0 8px 24px rgba(245,158,11,0.06);">
              <img src="${esc(imgUrl)}" alt="${esc(t.name)}" style="max-width:100%;max-height:440px;object-fit:contain;border-radius:18px;">
            </div>
          ` : `
            <div style="background:#fffbeb;border:3px solid #fef08a;border-radius:28px;padding:70px 24px;text-align:center;font-size:4rem;">🧸</div>
          `}
        </div>

        <div>
          <div style="display:inline-block;background:#fef3c7;border:1px solid #fde047;color:#b45309;padding:4px 14px;border-radius:9999px;font-size:0.82rem;font-weight:900;margin-bottom:16px;">
            CHILD-SAFE CERTIFIED TOY
          </div>
          <p style="font-size:1.15rem;line-height:1.75;color:#92400e;margin:0 0 24px;">
            ${esc(t.description || 'Delightful non-toxic developmental toy crafted for curious minds and safe everyday play.')}
          </p>

          <div style="background:#ffffff;border:3px solid #fef08a;border-radius:24px;padding:24px;margin-bottom:28px;box-shadow:0 4px 14px rgba(245,158,11,0.04);">
            <h3 style="color:#78350f;font-size:1.1rem;font-weight:900;margin:0 0 16px;">Toy Details & Materials</h3>
            <div style="display:flex;flex-direction:column;gap:12px;font-size:0.92rem;">
              ${p.material ? `
                <div style="display:flex;justify-content:space-between;padding-bottom:10px;border-bottom:1px dashed #fde047;">
                  <span style="color:#92400e;">Natural Materials</span>
                  <strong style="color:#78350f;">${esc(p.material)}</strong>
                </div>
              ` : ''}
              ${p.dimensions ? `
                <div style="display:flex;justify-content:space-between;padding-bottom:10px;border-bottom:1px dashed #fde047;">
                  <span style="color:#92400e;">Toy Dimensions</span>
                  <strong style="color:#78350f;">${esc(p.dimensions)}</strong>
                </div>
              ` : ''}
              <div style="display:flex;justify-content:space-between;">
                <span style="color:#92400e;">Safety Standards</span>
                <strong style="color:#f59e0b;">ASTM F963 / EN71 Certified</strong>
              </div>
            </div>
          </div>

          <a class="button" href="${path('contact/index.html')}?productId=${esc(encodeURIComponent(p.id))}" ${navAttrs('contact', p.id)} style="background:#f59e0b;color:#ffffff;font-weight:900;border-radius:9999px;padding:16px 36px;display:inline-block;box-shadow:0 8px 24px rgba(245,158,11,0.4);font-size:0.92rem;text-decoration:none;">
            ${esc(ui.inquire || 'Order Gift Bundle')} ↗
          </a>
        </div>
      </div>
    </section>
  `;
}

