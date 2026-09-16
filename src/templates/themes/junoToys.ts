import { esc, type ThemeContext } from './types';

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
          const imgUrl = asset(p.imageAssetId);
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
