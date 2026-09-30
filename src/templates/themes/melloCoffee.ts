import type { Product } from '../../shared/model';
import { esc, productPath, type ThemeContext } from './types';
export { melloStyles } from './melloStyles';

const base = '/templates/mello-coffee/';

export interface MelloMenuItem {
  category: string;
  name: string;
  desc: string;
  price1: string;
  price2: string;
  vol1: string;
  vol2: string;
}

export const melloDefaultMenu: MelloMenuItem[] = [
  // Espresso bar
  { category: 'Espresso bar', name: 'Espresso', desc: 'Fresh espresso classics.', price1: '$3.00', price2: '$4.00', vol1: '8 oz', vol2: '16 oz' },
  { category: 'Espresso bar', name: 'Americano', desc: 'Fresh espresso classics.', price1: '$3.50', price2: '$4.50', vol1: '8 oz', vol2: '16 oz' },
  { category: 'Espresso bar', name: 'Cappuccino', desc: 'Fresh espresso classics.', price1: '$4.25', price2: '$5.50', vol1: '8 oz', vol2: '16 oz' },
  { category: 'Espresso bar', name: 'Mello flat white', desc: 'Smooth and perfectly silky.', price1: '$4.50', price2: '$5.75', vol1: '8 oz', vol2: '16 oz' },
  { category: 'Espresso bar', name: 'Café latte', desc: 'Fresh espresso classics.', price1: '$4.75', price2: '$6.00', vol1: '8 oz', vol2: '16 oz' },

  // Coffee favorites
  { category: 'Coffee favorites', name: 'Classic mocha', desc: 'Sweet, creamy coffee creations.', price1: '$5.00', price2: '$6.25', vol1: '8 oz', vol2: '16 oz' },
  { category: 'Coffee favorites', name: 'Cherry cloud mocha', desc: 'Rich mocha with silky cherry cream.', price1: '$5.00', price2: '$6.00', vol1: '8 oz', vol2: '16 oz' },
  { category: 'Coffee favorites', name: 'Vanilla latte', desc: 'Creamy and softly balanced.', price1: '$5.00', price2: '$6.25', vol1: '8 oz', vol2: '16 oz' },
  { category: 'Coffee favorites', name: 'Caramel latte', desc: 'Sweet, creamy coffee creations.', price1: '$5.00', price2: '$6.25', vol1: '8 oz', vol2: '16 oz' },
  { category: 'Coffee favorites', name: 'Hot chocolate', desc: 'Sweet, creamy coffee creations.', price1: '$4.50', price2: '$5.75', vol1: '8 oz', vol2: '16 oz' },

  // Matcha & tea
  { category: 'Matcha & tea', name: 'Cold matcha', desc: 'Matcha with plenty of ice.', price1: '$5.25', price2: '$6.00', vol1: '8 oz', vol2: '16 oz' },
  { category: 'Matcha & tea', name: 'Strawberry matcha', desc: 'Fresh, creamy, and layered over ice.', price1: '$5.50', price2: '$6.50', vol1: '8 oz', vol2: '16 oz' },
  { category: 'Matcha & tea', name: 'Classic matcha latte', desc: 'Green, bright, and refreshing.', price1: '$5.00', price2: '$6.25', vol1: '8 oz', vol2: '16 oz' },
  { category: 'Matcha & tea', name: 'Chai latte', desc: 'Green, bright, and refreshing.', price1: '$4.75', price2: '$6.00', vol1: '8 oz', vol2: '16 oz' },
  { category: 'Matcha & tea', name: 'English breakfast tea', desc: 'Green, bright, and refreshing.', price1: '$3.50', price2: '$4.50', vol1: '8 oz', vol2: '16 oz' },

  // Cold drinks
  { category: 'Cold drinks', name: 'Cold brew', desc: 'Bold and refreshingly cold.', price1: '$4.50', price2: '$5.75', vol1: '8 oz', vol2: '16 oz' },
  { category: 'Cold drinks', name: 'Iced latte', desc: 'Cool drinks for brighter days.', price1: '$4.75', price2: '$6.00', vol1: '8 oz', vol2: '16 oz' },
  { category: 'Cold drinks', name: 'Espresso tonic', desc: 'Cool drinks for brighter days.', price1: '$5.00', price2: '$6.25', vol1: '8 oz', vol2: '16 oz' },
  { category: 'Cold drinks', name: 'Sparkling citrus', desc: 'Bright, bubbly, and refreshing.', price1: '$4.00', price2: '$5.25', vol1: '8 oz', vol2: '16 oz' },

  // Blended favorites
  { category: 'Blended favorites', name: 'Matcha blend', desc: 'Cold, creamy, and smooth.', price1: '$5.25', price2: '$6.50', vol1: '8 oz', vol2: '16 oz' },
  { category: 'Blended favorites', name: 'Mocha shake', desc: 'Rich, creamy, and chocolatey.', price1: '$5.50', price2: '$6.75', vol1: '8 oz', vol2: '16 oz' },
  { category: 'Blended favorites', name: 'Strawberry cream', desc: 'Cold, creamy, and smooth.', price1: '$5.25', price2: '$6.50', vol1: '8 oz', vol2: '16 oz' },
  { category: 'Blended favorites', name: 'Caramel coffee blend', desc: 'Cold, creamy, and smooth.', price1: '$5.50', price2: '$6.75', vol1: '8 oz', vol2: '16 oz' },
  { category: 'Blended favorites', name: 'Banana oat smoothie', desc: 'Cold, creamy, and smooth.', price1: '$5.00', price2: '$6.25', vol1: '8 oz', vol2: '16 oz' },

  // Bakes & bites
  { category: 'Bakes & bites', name: 'Big cinny bun', desc: 'Sticky and freshly baked.', price1: '$5.50', price2: '$18.00', vol1: 'x1', vol2: 'x4' },
  { category: 'Bakes & bites', name: 'Butter croissant', desc: 'Freshly baked little treats.', price1: '$4.00', price2: '$14.00', vol1: 'x1', vol2: 'x4' },
  { category: 'Bakes & bites', name: 'Chocolate cookie', desc: 'Freshly baked little treats.', price1: '$3.50', price2: '$12.00', vol1: 'x1', vol2: 'x4' },
  { category: 'Bakes & bites', name: 'Banana bread', desc: 'Freshly baked little treats.', price1: '$4.50', price2: '$16.00', vol1: 'x1', vol2: 'x4' },
  { category: 'Bakes & bites', name: 'Blueberry muffin', desc: 'Freshly baked little treats.', price1: '$4.25', price2: '$15.00', vol1: 'x1', vol2: 'x4' },
];

export const melloExampleProducts = (): Product[] => [
  { id: 'cold-matcha', name: 'Cold Matcha', description: 'Fresh green matcha shaken over ice with oat milk or whole milk.', material: 'Matcha, Ice, Milk', dimensions: '16 oz', imageAssetId: base + '6a75afbad8015a210ca48519_Cold matcha.avif' },
  { id: 'strawberry-matcha', name: 'Strawberry Matcha', description: 'Layered organic ceremonial matcha, fresh strawberry puree and milk over ice.', material: 'Matcha, Strawberry, Milk', dimensions: '16 oz', imageAssetId: base + '6a75afba3d5084e083fba4bc_Strawberry Matcha.avif' },
  { id: 'cherry-cloud-mocha', name: 'Cherry Cloud Mocha', description: 'Rich Dutch cocoa espresso topped with cold cherry cream foam and shaved chocolate.', material: 'Espresso, Cocoa, Cherry cream', dimensions: '16 oz', imageAssetId: base + '6a75afbac32121ab710a7d78_Cherry Cloud Mocha.avif' },
  { id: 'mello-flat-white', name: 'Mello Flat White', description: 'Double ristretto shot with micro-foamed textured milk for a silky, rich morning cup.', material: 'Espresso, Steamed milk', dimensions: '8 oz', imageAssetId: base + '6a75afbaa1b1193a5e9100ce_Vanilla Latte.avif' },
  { id: 'big-cinny-bun', name: 'Big Cinny Bun', description: 'Swedish-style brioche rolled with Saigon cinnamon, brown butter and vanilla glaze.', material: 'Brioche, Cinnamon, Vanilla glaze', dimensions: 'x1', imageAssetId: base + '6a75afba50d9616825ffc1c0_The Mello trio.avif' },
  { id: 'cold-brew', name: 'Cold Brew', description: 'Steeped for 18 hours using single-origin Ethiopian beans; naturally sweet with notes of stone fruit.', material: 'Cold brew coffee, Ice', dimensions: '8 oz / 16 oz', imageAssetId: base + '6a7980721dbf265ca4f4a0fb_Image.png' },
  { id: 'sparkling-citrus', name: 'Sparkling Citrus', description: 'Cold-pressed yuzu, blood orange, sparkling spring water and fresh mint over ice.', material: 'Yuzu, Blood orange, Soda', dimensions: '16 oz', imageAssetId: base + '6a75afbab67cd3668bf88be7_Sparkling Citrus.avif' },
  { id: 'mocha-shake', name: 'Mocha Shake', description: 'Double espresso blended with house chocolate fudge and organic vanilla bean cream.', material: 'Espresso, Chocolate fudge, Cream', dimensions: '16 oz', imageAssetId: base + '6a75afbafa260d1b0e5d182b_Mocha shake.avif' },
];

export function renderMelloPage(ctx: ThemeContext): string {
  const { draft, options, page, path, navPath, navAttrs, asset, translateProduct } = ctx;
  const c = draft.company;
  const isDemo = ['preview', 'materials-demo', 'mello-demo'].includes(options.projectId);
  const name = c.name || 'Mello';
  const address = c.address || '28 Roastery Lane, Brooklyn, NY';
  const hours = 'Open daily 7AM–6PM';
  const email = c.email || 'hi@mello.com';
  const copy = draft.copy[ctx.lang];
  const products = draft.products.length ? draft.products : isDemo ? melloExampleProducts() : [];

  const route = (p: string, label: string, cls = '', id?: string) =>
    `<a class="${cls}" href="${path(p === 'detail' ? productPath(id) : navPath(p))}${p === 'contact' && id ? '?productId=' + encodeURIComponent(id) : ''}" ${navAttrs(p, id)}>${label}</a>`;

  const anchor = (targetId: string, label: string, cls = '') =>
    page === 'home'
      ? `<a class="${cls}" href="#${targetId}">${label}</a>`
      : `<a class="${cls}" href="${path('index.html')}#${targetId}" ${navAttrs('home')}>${label}</a>`;

  const photo = (url: string, alt: string, cls = '', eager = false) =>
    `<img src="${esc(url)}" alt="${esc(alt)}" class="${cls}" width="1200" height="900" loading="${eager ? 'eager' : 'lazy'}" decoding="async"${eager ? ' fetchpriority="high"' : ''}>`;

  // Tickers
  const tickerItems = [
    'Good coffee',
    'No coffee snobbery',
    'Cold matcha',
    'Oat milk, no drama',
    'Fresh bakes',
    'Pastries before problems',
    'Big smiles',
  ];
  const renderTicker = () => `
    <div class="ticker">
      <div class="ticker-content">
        <div class="ticker-line first">
          ${tickerItems.map(item => `<div class="display-s">${esc(item)}</div><img width="Auto" height="Auto" alt="" src="${base}6a75b023c32121ab710aeb37_Illustration 1.svg" loading="lazy" class="illustration ticker-illu"/>`).join('')}
        </div>
        <div class="ticker-line second">
          ${tickerItems.map(item => `<div class="display-s">${esc(item)}</div><img width="Auto" height="Auto" alt="" src="${base}6a75b023c32121ab710aeb37_Illustration 1.svg" loading="lazy" class="illustration ticker-illu"/>`).join('')}
        </div>
      </div>
    </div>
  `;

  // Complete Menu Table
  const renderCompleteMenu = () => {
    const categories = ['Espresso bar', 'Coffee favorites', 'Matcha & tea', 'Cold drinks', 'Blended favorites', 'Bakes & bites'];
    const rows = [
      categories.slice(0, 2),
      categories.slice(2, 4),
      categories.slice(4, 6),
    ];
    return `
      <section id="menu" class="section both-padd">
        <div class="w-layout-blockcontainer container w-container">
          <div class="menu-section-content">
            <div class="section-heading default">
              <img src="${base}6a75b09837a7ee658908b74b_Illustration 12.svg" loading="lazy" width="Auto" height="Auto" alt="" class="illustration section-heading-illu"/>
              <h2 class="h2 heading-h2 align-center">The complete ${esc(name)} menu</h2>
            </div>
            <div class="menu-info">
              <div class="menu-categories">
                ${rows.map(catPair => `
                  <div class="menu-row">
                    ${catPair.map(cat => {
                      const items = melloDefaultMenu.filter(m => m.category === cat);
                      const isBakery = cat === 'Bakes & bites';
                      return `
                        <div class="menu-category">
                          <div class="category-header">
                            <h3 class="h3 h3-small">${esc(cat)}</h3>
                            <div class="text-and-volume-wrapper">
                              <p class="body-m">${isBakery ? 'Freshly baked little treats.' : cat === 'Matcha & tea' ? 'Green, bright, and refreshing.' : cat === 'Cold drinks' ? 'Cool drinks for brighter days.' : cat === 'Blended favorites' ? 'Cold, creamy, and smooth.' : cat === 'Coffee favorites' ? 'Sweet, creamy coffee creations.' : 'Fresh espresso classics.'}</p>
                              <div class="volumes-wrapper">
                                <div class="body-m volume-text opacity">${isBakery ? 'x1' : '8 oz'}</div>
                                <div class="body-m volume-text opacity">${isBakery ? 'x4' : '16 oz'}</div>
                              </div>
                            </div>
                          </div>
                          <div class="menu-items">
                            ${items.map(item => `
                              <div class="menu-item">
                                <p class="body-l">${esc(item.name)}</p>
                                <div class="volumes-wrapper">
                                  <div class="body-m volume-text">${esc(item.price1)}</div>
                                  <div class="body-m volume-text">${esc(item.price2)}</div>
                                </div>
                              </div>
                            `).join('')}
                          </div>
                        </div>
                      `;
                    }).join('')}
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  };

  // Receipt Card
  const renderReceipt = () => `
    <div class="receipt-wrapper">
      <div class="receipt">
        <div class="receipt-circles top">
          ${Array.from({ length: 16 }).map(() => '<div class="receipt-circle"></div>').join('')}
        </div>
        <div class="receipt-circles bottom">
          ${Array.from({ length: 16 }).map(() => '<div class="receipt-circle"></div>').join('')}
        </div>
        <div class="receipt-info">
          <div class="receipt-header">
            <div class="logo-text">
              <a href="#" class="logo w-inline-block"><div class="logo-font">${esc(name)}</div></a>
              <div class="handwritten-s">Morning mood office</div>
            </div>
            <img src="${base}6a75b098c4b98d47b861adaf_Illustration 14.svg" loading="lazy" width="Auto" height="Auto" alt="" class="illustration receipt-illu"/>
          </div>
          <div class="divider-border"></div>
          <div class="receipt-items">
            <div class="receipt-item"><p class="body-m">Kind humans</p><div class="emphasis-m x">Always</div></div>
            <div class="receipt-item"><p class="body-m">Great beans</p><div class="emphasis-m x">Daily</div></div>
            <div class="receipt-item"><p class="body-m">Coffee snobbery</p><div class="emphasis-m x">$0.00</div></div>
            <div class="receipt-item"><p class="body-m">Warm pastries</p><div class="emphasis-m x">Yes pls</div></div>
          </div>
          <div class="divider-border"></div>
          <div class="receipt-total"><p class="body-m">Total</p><div class="display-s x">One good day</div></div>
          <div class="divider-border"></div>
        </div>
        <div class="barcode-text">
          <img src="${base}6a79d84f66b35ff04116b1a9_Barcode.svg" loading="lazy" width="Auto" height="Auto" alt="" class="image barcode"/>
          <div class="barcode-text-wrapper">
            <img src="${base}6a75b023c32121ab710aeb37_Illustration 1.svg" loading="lazy" width="Auto" height="Auto" alt="" class="illustration barcode-illu"/>
            <div class="padd-text-wrapper"><div class="handwritten-s">Thank you!</div></div>
          </div>
        </div>
      </div>
      <img src="${base}6a75b097c4b98d47b861adaa_Illustration 1.svg" loading="lazy" width="Auto" height="Auto" alt="" class="illustration receipt-1-illu"/>
      <img src="${base}6a75b097c4b98d47b861adaa_Illustration 1.svg" loading="lazy" width="Auto" height="Auto" alt="" class="illustration receipt-2-illu"/>
      <img src="${base}6a75b097c4b98d47b861adaa_Illustration 1.svg" loading="lazy" width="Auto" height="Auto" alt="" class="illustration receipt-3-illu"/>
      <img src="${base}6a75b0989cfc97841072ed16_Illustration 26.svg" loading="lazy" width="Auto" height="Auto" alt="" class="illustration receipt-4-illu"/>
    </div>
  `;

  // Philosophy section
  const renderPhilosophy = () => `
    <section class="section both-padd black">
      <div class="w-layout-blockcontainer container w-container">
        <div class="philosophy-content">
          <div class="philosophy-info">
            <div class="title-and-text-wrapper">
              <div class="label-and-title">
                <div class="label w-variant-741ec5de-91c1-1c12-f741-a9f22b3a3b72">
                  <div class="circle"></div>
                  <div class="handwritten-l">What matters</div>
                </div>
                <h2 class="h2 heading-h2">
                  <div class="h2"><span class="h2">Things that make mornings </span><span class="h2 accent">feel better.</span></div>
                </h2>
              </div>
              <p class="body-l block-description">We started ${esc(name)} to make specialty coffee feel less serious and a lot more human.</p>
            </div>
            <div class="buttons-wrapper">
              ${anchor('reviews', '<div class="button-border"></div><div class="button-background"></div><div class="emphasis-l top-index">Read reviews</div>', 'button w-inline-block')}
              <a href="https://google.com/maps" target="_blank" class="button w-variant-4be33950-fd64-2206-c3d4-b88ff314674c w-inline-block">
                <div class="button-border w-variant-4be33950-fd64-2206-c3d4-b88ff314674c"></div>
                <div class="button-background w-variant-4be33950-fd64-2206-c3d4-b88ff314674c"></div>
                <div class="emphasis-l top-index">Get directions</div>
              </a>
            </div>
          </div>
          ${renderReceipt()}
        </div>
      </div>
    </section>
  `;

  // Seating spots
  const renderAtmosphere = () => `
    <section id="place" class="section top-padd">
      <div class="w-layout-blockcontainer container w-container">
        <div class="atmosphere-content">
          <div class="section-heading">
            <div class="heading-title">
              <div class="label"><div class="circle"></div><div class="handwritten-l">Take a seat</div></div>
              <h2 class="h2 heading-h2">Pull up a chair. You’re staying</h2>
            </div>
            <div class="text-wrapper"><p class="body-l secton-description">Come for something good and stay as long as you like.</p></div>
          </div>
          <div class="spot w-tabs" data-mello-spot>
            <div class="w-tab-content">
              <!-- Spot 1 -->
              <div data-w-tab="0" class="w-tab-pane w--tab-active">
                <div class="spot-content">
                  <div class="spot-image">
                    <img src="${base}6a75afba37a7ee658908211b_Coffee Shop.avif" loading="lazy" width="Auto" height="Auto" alt="Bright coffee shop interior" class="image background-image"/>
                    <div class="hotspot-wrapper _1" data-spot-idx="0"><div class="hotspot active"><div class="hotspot-content"><div class="emphasis-m">01</div></div></div></div>
                    <div class="hotspot-wrapper _2" data-spot-idx="1"><div class="hotspot"><div class="hotspot-content"><div class="emphasis-m">02</div></div></div></div>
                    <div class="hotspot-wrapper _3" data-spot-idx="2"><div class="hotspot"><div class="hotspot-content"><div class="emphasis-m">03</div></div></div></div>
                    <div class="hotspot-wrapper _4" data-spot-idx="3"><div class="hotspot"><div class="hotspot-content"><div class="emphasis-m">04</div></div></div></div>
                  </div>
                  <div class="spot-info">
                    <div class="spot-details">
                      <div class="handwritten-s opacity">01/04</div>
                      <div class="illustration-text">
                        <img src="${base}6a75b02344e2098c39638e38_Illustration 5.svg" loading="lazy" width="Auto" height="Auto" alt="" class="illustration spot-illu"/>
                        <div class="text-hashtags">
                          <div class="block-text-wrapper"><h3 class="h3 block-title small">Catch the sun</h3><p class="body-m block-description small">Grab a warm seat, order your favorite, and let the morning take its time.</p></div>
                          <div class="hashtags"><div class="handwritten-s">#beforenoon</div><div class="handwritten-s">#sunnyspot</div></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <!-- Spot 2 -->
              <div data-w-tab="1" class="w-tab-pane">
                <div class="spot-content">
                  <div class="spot-image">
                    <img src="${base}6a75afba37a7ee658908211b_Coffee Shop.avif" loading="lazy" width="Auto" height="Auto" alt="Bright coffee shop interior" class="image background-image"/>
                    <div class="hotspot-wrapper _1" data-spot-idx="0"><div class="hotspot"><div class="hotspot-content"><div class="emphasis-m">01</div></div></div></div>
                    <div class="hotspot-wrapper _2" data-spot-idx="1"><div class="hotspot active"><div class="hotspot-content"><div class="emphasis-m">02</div></div></div></div>
                    <div class="hotspot-wrapper _3" data-spot-idx="2"><div class="hotspot"><div class="hotspot-content"><div class="emphasis-m">03</div></div></div></div>
                    <div class="hotspot-wrapper _4" data-spot-idx="3"><div class="hotspot"><div class="hotspot-content"><div class="emphasis-m">04</div></div></div></div>
                  </div>
                  <div class="spot-info">
                    <div class="spot-details">
                      <div class="handwritten-s opacity">02/04</div>
                      <div class="illustration-text">
                        <img src="${base}6a75b023b67cd3668bf8c76b_Illustration 15.svg" loading="lazy" width="Auto" height="Auto" alt="" class="illustration spot-illu"/>
                        <div class="text-hashtags">
                          <div class="block-text-wrapper"><h3 class="h3 block-title small">Close to the action</h3><p class="body-m block-description small">Take a counter seat and see every drink come together from start to finish.</p></div>
                          <div class="hashtags"><div class="handwritten-s">#Social</div><div class="handwritten-s">#Lively</div></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <!-- Spot 3 -->
              <div data-w-tab="2" class="w-tab-pane">
                <div class="spot-content">
                  <div class="spot-image">
                    <img src="${base}6a75afba37a7ee658908211b_Coffee Shop.avif" loading="lazy" width="Auto" height="Auto" alt="Bright coffee shop interior" class="image background-image"/>
                    <div class="hotspot-wrapper _1" data-spot-idx="0"><div class="hotspot"><div class="hotspot-content"><div class="emphasis-m">01</div></div></div></div>
                    <div class="hotspot-wrapper _2" data-spot-idx="1"><div class="hotspot"><div class="hotspot-content"><div class="emphasis-m">02</div></div></div></div>
                    <div class="hotspot-wrapper _3" data-spot-idx="2"><div class="hotspot active"><div class="hotspot-content"><div class="emphasis-m">03</div></div></div></div>
                    <div class="hotspot-wrapper _4" data-spot-idx="3"><div class="hotspot"><div class="hotspot-content"><div class="emphasis-m">04</div></div></div></div>
                  </div>
                  <div class="spot-info">
                    <div class="spot-details">
                      <div class="handwritten-s opacity">03/04</div>
                      <div class="illustration-text">
                        <img src="${base}6a75b023799955559321f001_Illustration 16.svg" loading="lazy" width="Auto" height="Auto" alt="" class="illustration spot-illu"/>
                        <div class="text-hashtags">
                          <div class="block-text-wrapper"><h3 class="h3 block-title small">Hide out here</h3><p class="body-m block-description small">Your tucked-away spot for quiet sips, focused work, and slower moments.</p></div>
                          <div class="hashtags"><div class="handwritten-s">#1seat</div><div class="handwritten-s">#laptopfriendly</div></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <!-- Spot 4 -->
              <div data-w-tab="3" class="w-tab-pane">
                <div class="spot-content">
                  <div class="spot-image">
                    <img src="${base}6a75afba37a7ee658908211b_Coffee Shop.avif" loading="lazy" width="Auto" height="Auto" alt="Bright coffee shop interior" class="image background-image"/>
                    <div class="hotspot-wrapper _1" data-spot-idx="0"><div class="hotspot"><div class="hotspot-content"><div class="emphasis-m">01</div></div></div></div>
                    <div class="hotspot-wrapper _2" data-spot-idx="1"><div class="hotspot"><div class="hotspot-content"><div class="emphasis-m">02</div></div></div></div>
                    <div class="hotspot-wrapper _3" data-spot-idx="2"><div class="hotspot"><div class="hotspot-content"><div class="emphasis-m">03</div></div></div></div>
                    <div class="hotspot-wrapper _4" data-spot-idx="3"><div class="hotspot active"><div class="hotspot-content"><div class="emphasis-m">04</div></div></div></div>
                  </div>
                  <div class="spot-info">
                    <div class="spot-details">
                      <div class="handwritten-s opacity">04/04</div>
                      <div class="illustration-text">
                        <img src="${base}6a75b024c56e938d21ea3c70_Illustration 17.svg" loading="lazy" width="Auto" height="Auto" alt="" class="illustration spot-illu"/>
                        <div class="text-hashtags">
                          <div class="block-text-wrapper"><h3 class="h3 block-title small">Bring the whole crew</h3><p class="body-m block-description small">Grab the big table and fill it with coffee, stories, and your favorite people.</p></div>
                          <div class="hashtags"><div class="handwritten-s">#Social</div><div class="handwritten-s">#Spacious</div></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="spot-tabs w-tab-menu">
              <a data-spot-btn="0" class="spot-tab w-inline-block w--current"><div class="handwritten-s x">01</div><div class="display-s">Catch the sun</div></a>
              <a data-spot-btn="1" class="spot-tab w-inline-block"><div class="handwritten-s x">02</div><div class="display-s">Close to the action</div></a>
              <a data-spot-btn="2" class="spot-tab w-inline-block"><div class="handwritten-s x">03</div><div class="display-s">Hide out here</div></a>
              <a data-spot-btn="3" class="spot-tab w-inline-block"><div class="handwritten-s x">04</div><div class="display-s">Bring the whole crew</div></a>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;

  // Testimonials Slider
  const renderTestimonials = () => `
    <section id="reviews" class="section testimonials-section">
      <div class="w-layout-blockcontainer container fill w-container">
        <div class="testimonials-content">
          <div class="testimonials-slider" data-mello-slider>
            <div class="mask w-slider-mask">
              <div class="w-slide active" data-slide-index="0">
                <div class="testimonials-info">
                  <img src="${base}6a75b098d0b882b5a81bf2a4_Illustration 19.svg" loading="lazy" width="Auto" height="Auto" alt="" class="illustration slider-illu"/>
                  <p class="display-m slider-text">Come for the great coffee, stay for the perfect playlist and those cinnamon buns you’ll keep thinking about.</p>
                  <div class="rating-and-name">
                    <div class="rating">
                      <img src="${base}6a75b098e703ce19611402cb_Illustration 18.svg" loading="lazy" width="Auto" height="Auto" alt="" class="illustration rating-illu"/>
                      <div class="text-w"><div class="handwritten-l">4.9</div></div>
                    </div>
                    <div class="divider-line"></div>
                    <div class="body-l">Mia Carter</div>
                  </div>
                </div>
              </div>
              <div class="w-slide" data-slide-index="1">
                <div class="testimonials-info">
                  <img src="${base}6a75b098d0b882b5a81bf2a4_Illustration 19.svg" loading="lazy" width="Auto" height="Auto" alt="" class="illustration slider-illu"/>
                  <p class="display-m slider-text">Everything you want from a neighborhood coffee shop: warm, welcoming, and always worth the walk.</p>
                  <div class="rating-and-name">
                    <div class="rating">
                      <img src="${base}6a75b098e703ce19611402cb_Illustration 18.svg" loading="lazy" width="Auto" height="Auto" alt="" class="illustration rating-illu"/>
                      <div class="text-w"><div class="handwritten-l">5.0</div></div>
                    </div>
                    <div class="divider-line"></div>
                    <div class="body-l">Jamie Brooks</div>
                  </div>
                </div>
              </div>
              <div class="w-slide" data-slide-index="2">
                <div class="testimonials-info">
                  <img src="${base}6a75b098d0b882b5a81bf2a4_Illustration 19.svg" loading="lazy" width="Auto" height="Auto" alt="" class="illustration slider-illu"/>
                  <p class="display-m slider-text">The cold brew is smooth, the space feels effortless, and everyone behind the counter is genuinely lovely.</p>
                  <div class="rating-and-name">
                    <div class="rating">
                      <img src="${base}6a75b098e703ce19611402cb_Illustration 18.svg" loading="lazy" width="Auto" height="Auto" alt="" class="illustration rating-illu"/>
                      <div class="text-w"><div class="handwritten-l">5.0</div></div>
                    </div>
                    <div class="divider-line"></div>
                    <div class="body-l">Alex Morgan</div>
                  </div>
                </div>
              </div>
            </div>
            <div class="slider-button _1" data-slider-prev>
              <img src="${base}6a75aff0951d08179b6e855c_ArrowLeft.svg" loading="lazy" alt="" class="icon slider-icon default"/>
            </div>
            <div class="slider-button _2" data-slider-next>
              <img src="${base}6a75aff0a338b1f1d502996b_ArrowRight.svg" loading="lazy" alt="" class="icon slider-icon default"/>
            </div>
            <div class="slide-nav">
              <div class="w-slider-dot w-active" data-dot="0"></div>
              <div class="w-slider-dot" data-dot="1"></div>
              <div class="w-slider-dot" data-dot="2"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;

  // Visit section Bento
  const renderVisit = () => `
    <section id="visit" class="section both-padd large black">
      <div class="border top-border white"></div>
      <div class="border bottom-border white"></div>
      <div class="w-layout-blockcontainer container w-container">
        <div class="visit-content">
          <div class="section-heading default">
            <div class="label w-variant-741ec5de-91c1-1c12-f741-a9f22b3a3b72"><div class="circle"></div><div class="handwritten-l">See you soon</div></div>
            <h2 class="h2 heading-h2 align-center">Take a peek. Come on over</h2>
            <img src="${base}6a75b0973d5084e083fc54e8_Illustration 23.svg" loading="lazy" alt="" class="illustration visit-section-1"/>
            <img src="${base}6a75b0987e1c74da2e34edc8_Illustration 24.svg" loading="lazy" alt="" class="illustration visit-section-2"/>
          </div>
          <div class="visit-info">
            <div class="photo-block-wrapper">
              <div class="photo-block">
                <div class="photo-image-wrapper">
                  <img src="${base}6a75afba618cda3073b50665_Cherry on top.avif" loading="lazy" alt="Glass of iced chocolate drink" class="image background-image"/>
                </div>
                <div class="photo-text-wrapper"><div class="handwritten-l">Cherry on top</div></div>
              </div>
            </div>
            <div class="column second">
              <div class="p-block-wrapper">
                <div class="photo-block">
                  <div class="photo-image-wrapper">
                    <img src="${base}6a75afba951d08179b6e656c_Sweet little moment.avif" loading="lazy" alt="People enjoying coffee and pastries" class="image background-image"/>
                  </div>
                  <div class="photo-text-wrapper"><div class="handwritten-l">Sweet little moment</div></div>
                </div>
              </div>
              <div class="contact-items">
                <a href="https://google.com/maps" target="_blank" class="location-block w-inline-block">
                  <div class="location-info">
                    <div class="handwritten-s">${esc(name)}’s here</div>
                    <h3 class="h3 h3-small block-text">${esc(address)}</h3>
                  </div>
                  <div class="illu-wrapper">
                    <img src="${base}6a75b0237c30003645af44b1_Illustration 20.svg" loading="lazy" class="illustration location-block-illu default"/>
                  </div>
                </a>
                <a href="mailto:${esc(email)}" class="email-block w-inline-block">
                  <div class="email-illu-wrapper">
                    <img src="${base}6a75b0239cfc97841072998b_Illustration 21.svg" loading="lazy" class="illustration email-block-illu default"/>
                  </div>
                  <h3 class="h3 h3-small email-block-text">Say hello!</h3>
                </a>
              </div>
            </div>
            <div class="column">
              <div class="hours-block">
                <div class="block-text-wrapper small">
                  <div class="handwritten-s">See you soon</div>
                  <h3 class="h3 h3-small">${esc(hours)}</h3>
                </div>
                <img src="${base}6a75b02324f6b52c0c3d3a94_Illustration 22.svg" loading="lazy" width="Auto" height="Auto" alt="" class="illustration hours-block-illu"/>
              </div>
              <div class="p-block-wrapper">
                <div class="photo-block">
                  <div class="photo-image-wrapper">
                    <img src="${base}6a75afba50d9616825ffc1c0_The Mello trio.avif" loading="lazy" alt="The Mello trio" class="image background-image"/>
                  </div>
                  <div class="photo-text-wrapper"><div class="handwritten-l">The ${esc(name)} trio</div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;

  let mainContent = '';

  if (page === 'home') {
    mainContent = `
      <!-- Hero -->
      <section class="hero" data-wr-hero>
        <div class="w-layout-blockcontainer container w-container">
          <div class="hero-content">
            <div class="hero-text wr-confirmed-hero-copy">
              <span class="eyebrow" style="display:none"></span>
              <h1 class="h1 hero-h1">${copy?.headline || c.slogan ? esc(copy?.headline || c.slogan).replace(/\n/g, '<br/>') : 'A brighter kind<br/>of coffee break'}</h1>
              <p class="hero-p"${copy?.subtitle ? '' : ' style="display:none"'}>${copy?.subtitle ? esc(copy.subtitle) : ''}</p>
              <div class="buttons-wrapper">
                ${anchor('menu', '<div class="button-border"></div><div class="button-background"></div><div class="emphasis-l top-index">' + esc(copy?.cta || 'Explore the menu') + '</div>', 'button w-inline-block')}
                <a href="${esc(path('contact/index.html'))}" class="button w-variant-c95095ce-7382-225f-41af-d39d3577dbad w-inline-block">
                  <div class="button-border w-variant-c95095ce-7382-225f-41af-d39d3577dbad"></div>
                  <div class="button-background w-variant-c95095ce-7382-225f-41af-d39d3577dbad"></div>
                  <div class="emphasis-l top-index">Get directions</div>
                </a>
              </div>
            </div>
            <div class="hero-image">
              <img src="${base}6a75afbad8015a210ca48519_Cold matcha.avif" fetchpriority="high" loading="eager" width="Auto" height="Auto" alt="Clear glass filled with iced green matcha tea" class="image hero-image"/>
              <div class="product">
                <div class="product-text-wrapper">
                  <div class="display-s">Cold matcha</div>
                  <div class="details">
                    <div class="body-m">Matcha</div>
                    <div class="divider"></div>
                    <div class="body-m">Plenty of ice</div>
                  </div>
                </div>
                <div class="details">
                  <div class="emphasis-m">$6.00</div>
                  <div class="volume"><div class="body-s">16 oz</div></div>
                </div>
              </div>
              <img src="${base}6a75b02394d7844142e1e1a2_Illustration 2.svg" loading="lazy" width="Auto" height="Auto" alt="" class="illustration hero-arrow"/>
              <div class="quality-badge">
                <img src="${base}6a75b0977c30003645af92eb_Illustration 3.svg" loading="lazy" width="Auto" height="Auto" alt="" class="illustration quality-badge-illu"/>
                <div class="handwritten-l">100% pure<br/>green energy</div>
              </div>
            </div>
            <img src="${base}6a75b097c4b98d47b861ada2_Illustration 4.svg" loading="lazy" width="Auto" height="Auto" alt="" class="illustration hero-1-illu"/>
            <img src="${base}6a75b0977e1c74da2e34edb4_Illustration 5.svg" loading="lazy" width="Auto" height="Auto" alt="" class="illustration hero-2-illu"/>
          </div>
        </div>
      </section>

      ${renderTicker()}

      <!-- Feature Bento Cards: Choose your cup of happy -->
      <section class="section top-padd">
        <div class="w-layout-blockcontainer container w-container">
          <div class="products-content">
            <div class="section-heading">
              <div class="heading-title">
                <div class="label"><div class="circle"></div><div class="handwritten-l">Coffee this way</div></div>
                <h2 class="h2 heading-h2">Choose your cup of happy</h2>
              </div>
              <div class="text-wrapper"><p class="body-l secton-description">Hot, iced, bold, or sweet – there’s a happy cup waiting.</p></div>
            </div>
            <div class="menu-blocks">
              <!-- Strawberry Matcha -->
              <div class="image-featured-menu-block-wrapper">
                <div class="image-featured-menu-block">
                  <img src="${base}6a75afba3d5084e083fba4bc_Strawberry Matcha.avif" loading="lazy" alt="Layered strawberry matcha drink" class="image bg-image"/>
                  <div class="linear"></div>
                  <div class="block-items-wrapper">
                    <div class="name-and-details">
                      <div class="details"><div class="body-m">Matcha</div><div class="divider white"></div><div class="body-m">Strawberry</div></div>
                      <h3 class="h3 block-title">Strawberry matcha</h3>
                    </div>
                    <p class="body-m block-description">Fresh, creamy, and layered over ice.</p>
                  </div>
                  <div class="details">
                    <div class="emphasis-l">$6.50</div>
                    <div class="volume w-variant-c117d205-5160-da51-4d35-ee2981ddee0e"><div class="body-s">16 oz</div></div>
                  </div>
                  <div class="badge"><div class="handwritten-s">Favorite</div></div>
                </div>
              </div>
              <div class="menu-blocks-wrapper">
                <!-- Cherry Cloud Mocha -->
                <div class="image-featured-menu-block-wrapper _2">
                  <div class="image-featured-menu-block">
                    <img src="${base}6a75afbac32121ab710a7d78_Cherry Cloud Mocha.avif" loading="lazy" alt="Iced chocolate drink" class="image bg-image"/>
                    <div class="linear"></div>
                    <div class="block-items-wrapper">
                      <div class="name-and-details">
                        <div class="details"><div class="body-m">Cocoa</div><div class="divider white"></div><div class="body-m">Dark cherry</div></div>
                        <h3 class="h3 block-title">Cherry cloud mocha</h3>
                      </div>
                      <p class="body-m block-description">Rich mocha with silky cherry cream.</p>
                    </div>
                    <div class="details">
                      <div class="emphasis-l">$6.00</div>
                      <div class="volume w-variant-c117d205-5160-da51-4d35-ee2981ddee0e"><div class="body-s">16 oz</div></div>
                    </div>
                  </div>
                </div>
                <!-- Small duo -->
                <div class="menu-blocks-wrapper small">
                  <!-- Mello Flat White -->
                  <div class="illustration-featured-menu-block">
                    <div class="illustration-and-text-wrapper">
                      <img src="${base}6a75b024c56e938d21ea3c6b_Illustration 6.svg" loading="lazy" class="illustration featured-block-illu"/>
                      <div class="handwritten-s">Your 8am<br/>personality</div>
                    </div>
                    <div class="info">
                      <div class="block-items-wrapper">
                        <div class="name-and-details">
                          <div class="details"><div class="body-m">Espresso</div><div class="divider"></div><div class="body-m">Milk</div></div>
                          <h3 class="h3 h3-small">Mello flat white</h3>
                        </div>
                        <p class="body-m">Smooth and perfectly silky.</p>
                      </div>
                      <div class="details">
                        <div class="emphasis-l">$4.50</div>
                        <div class="volume"><div class="body-s">8 oz</div></div>
                      </div>
                    </div>
                  </div>
                  <!-- Big Cinny Bun -->
                  <div class="illustration-featured-menu-block w-variant-faaa4315-b712-1925-827e-0cc7395f755f">
                    <div class="illustration-and-text-wrapper">
                      <img src="${base}6a75b0847a22773039a72ff7_Illustration 7.svg" loading="lazy" class="illustration featured-block-illu"/>
                      <div class="handwritten-s">Sticky fingers<br/>guaranteed</div>
                    </div>
                    <div class="info">
                      <div class="block-items-wrapper">
                        <div class="name-and-details">
                          <div class="details"><div class="body-m">Cinnamon</div><div class="divider"></div><div class="body-m">Vanilla</div></div>
                          <h3 class="h3 h3-small">Big cinny bun</h3>
                        </div>
                        <p class="body-m">Sticky and freshly baked.</p>
                      </div>
                      <div class="details">
                        <div class="emphasis-l">$5.50</div>
                        <div class="volume"><div class="body-s">x1</div></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Complete Menu Table -->
      ${renderCompleteMenu()}

      ${renderTicker()}

      <!-- Interactive Mood Wheel -->
      <section class="section both-padd black" data-mello-mood>
        <div class="w-layout-blockcontainer container w-container">
          <div class="mood-content">
            <div class="section-heading default">
              <div class="heading-text-wrapper">
                <div class="label w-variant-741ec5de-91c1-1c12-f741-a9f22b3a3b72"><div class="circle"></div><div class="handwritten-l">Mood matcher</div></div>
                <div class="h2 heading-h2">What are you in the mood for?</div>
              </div>
              <img src="${base}6a75b097d6cd358791bbedc8_Illustration 10.svg" loading="lazy" width="Auto" height="Auto" alt="" class="illustration mood-illu"/>
            </div>
            <div class="wheel-product">
              <div class="text-and-wheel">
                <div class="body-m align-center vertical">Choose your mood. We'll do the rest.</div>
                <div class="wheel">
                  <div class="wheel-blocks">
                    <div class="wheel-block active" data-mood="0" data-deg="-45">
                      <div class="wheel-text"><div class="handwritten-s">Energized</div><div class="display-s">Need a boost</div></div>
                    </div>
                    <div class="wheel-block w-variant-c3cea76c-f715-02ec-6c87-fc8cb25a45cd" data-mood="1" data-deg="45">
                      <div class="wheel-text"><div class="handwritten-s">Cozy</div><div class="display-s">Take it slow</div></div>
                    </div>
                  </div>
                  <div class="wheel-blocks">
                    <div class="wheel-block w-variant-4fd6df7f-2fdc-eeb5-087e-32f96cf9d86e" data-mood="2" data-deg="-135">
                      <div class="wheel-text"><div class="handwritten-s">Refreshed</div><div class="display-s">Keep it fresh</div></div>
                    </div>
                    <div class="wheel-block w-variant-b6aea3f4-3b6c-48a1-2178-70e52cc9d285" data-mood="3" data-deg="135">
                      <div class="wheel-text"><div class="handwritten-s">Indulgent</div><div class="display-s">Treat myself</div></div>
                    </div>
                  </div>
                  <div class="wheel-center">
                    <img src="${base}6a75b023c58cbf65bdb5a13f_Illustration 8.svg" loading="lazy" width="Auto" height="Auto" alt="" class="illustration wheel-arrow" style="transform: rotate(-45deg)"/>
                    <div class="wheel-circle"><img src="${base}6a75b023c32121ab710aeb37_Illustration 1.svg" loading="lazy" width="Auto" height="Auto" alt="" class="illustration wheel-center-illu"/></div>
                  </div>
                </div>
                <img src="${base}6a75b098766be2add116e6ef_Illustration 25.svg" loading="lazy" width="Auto" height="Auto" alt="" class="illustration wheel-illu"/>
                <img src="${base}6a75b08437a7ee6589089b9f_Illustration 8.svg" loading="lazy" width="Auto" height="Auto" alt="" class="illustration wheel-illu-arrow"/>
              </div>
              <div class="product-block-wrapper">
                <!-- Mood 1: Cold Brew -->
                <div class="prod-block-wrapper _1 active" data-prod-card="0">
                  <div class="product-block">
                    <div class="image-wrapper"><img src="${base}6a7980721dbf265ca4f4a0fb_Image.png" loading="lazy" class="image background-image"/></div>
                    <div class="info-wrapper">
                      <div class="block-items-wrapper">
                        <div class="name-and-details"><div class="details"><div class="body-m">Coffee</div><div class="divider"></div><div class="body-m">Ice</div></div><h3 class="h3 h3-small">Cold brew</h3></div>
                        <p class="body-m">Bold and refreshingly cold.</p>
                      </div>
                      <div class="details"><div class="emphasis-l">$4.50</div><div class="volume"><div class="body-s">8 oz</div></div></div>
                    </div>
                  </div>
                </div>
                <!-- Mood 2: Vanilla Latte -->
                <div class="prod-block-wrapper _2" data-prod-card="1">
                  <div class="product-block">
                    <div class="image-wrapper"><img src="${base}6a75afbaa1b1193a5e9100ce_Vanilla Latte.avif" loading="lazy" class="image background-image"/></div>
                    <div class="info-wrapper">
                      <div class="block-items-wrapper">
                        <div class="name-and-details"><div class="details"><div class="body-m">Espresso</div><div class="divider"></div><div class="body-m">Vanilla</div></div><h3 class="h3 h3-small">Vanilla latte</h3></div>
                        <p class="body-m">Creamy and softly balanced.</p>
                      </div>
                      <div class="details"><div class="emphasis-l">$6.25</div><div class="volume"><div class="body-s">16 oz</div></div></div>
                    </div>
                  </div>
                </div>
                <!-- Mood 3: Sparkling Citrus -->
                <div class="prod-block-wrapper _3" data-prod-card="2">
                  <div class="product-block">
                    <div class="image-wrapper"><img src="${base}6a75afbab67cd3668bf88be7_Sparkling Citrus.avif" loading="lazy" class="image background-image"/></div>
                    <div class="info-wrapper">
                      <div class="block-items-wrapper">
                        <div class="name-and-details"><div class="details"><div class="body-m">Citrus</div><div class="divider"></div><div class="body-m">Soda</div></div><h3 class="h3 h3-small">Sparkling citrus</h3></div>
                        <p class="body-m">Bright, bubbly, and refreshing.</p>
                      </div>
                      <div class="details"><div class="emphasis-l">$5.25</div><div class="volume"><div class="body-s">16 oz</div></div></div>
                    </div>
                  </div>
                </div>
                <!-- Mood 4: Mocha Shake -->
                <div class="prod-block-wrapper _4" data-prod-card="3">
                  <div class="product-block">
                    <div class="image-wrapper"><img src="${base}6a75afbafa260d1b0e5d182b_Mocha shake.avif" loading="lazy" class="image background-image"/></div>
                    <div class="info-wrapper">
                      <div class="block-items-wrapper">
                        <div class="name-and-details"><div class="details"><div class="body-m">Mocha</div><div class="divider"></div><div class="body-m">Cream</div></div><h3 class="h3 h3-small">Mocha shake</h3></div>
                        <p class="body-m">Rich, creamy, and chocolatey.</p>
                      </div>
                      <div class="details"><div class="emphasis-l">$6.75</div><div class="volume"><div class="body-s">16 oz</div></div></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Coffee O'clock Time Tabs -->
      <section class="section both-padd large" data-mello-time>
        <div class="border top-border"></div>
        <div class="border bottom-border"></div>
        <div class="w-layout-blockcontainer container w-container">
          <div class="time-content">
            <div class="section-heading">
              <div class="heading-title">
                <div class="label"><div class="circle"></div><div class="handwritten-l">Coffee o’clock</div></div>
                <h2 class="h2 heading-h2">The right cup, right on time</h2>
              </div>
              <div class="text-wrapper"><p class="body-l secton-description">Start bright, slow down, or treat yourself whenever.</p></div>
            </div>
            <div class="time-info">
              <div class="time-wrapper w-tabs">
                <div class="w-tab-content">
                  <!-- Time 1 -->
                  <div data-w-tab="0" class="w-tab-pane w--tab-active">
                    <div class="time-wrapper-content">
                      <div class="name"><div class="handwritten-l opacity">01</div><div class="handwritten-l">Morning glow</div></div>
                      <div class="time-wrapper-info">
                        <div class="time"><div class="display-l">07</div><div class="display-l white">:</div><div class="display-l">03</div></div>
                        <div class="illustration-and-text">
                          <img src="${base}6a75b097c4b98d47b861ada2_Illustration 4.svg" loading="lazy" class="illustration time-illu"/>
                          <div class="block-text-wrapper"><h3 class="h3 block-title small">First sip</h3><p class="body-m block-description small">Doors open. Espresso machine sings. The day suddenly looks possible.</p></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- Time 2 -->
                  <div data-w-tab="1" class="w-tab-pane">
                    <div class="time-wrapper-content">
                      <div class="name"><div class="handwritten-l opacity">02</div><div class="handwritten-l">Power hour</div></div>
                      <div class="time-wrapper-info">
                        <div class="time"><div class="display-l">10</div><div class="display-l white">:</div><div class="display-l">12</div></div>
                        <div class="illustration-and-text">
                          <img src="${base}6a75b09837a7ee658908b74e_Illustration 11.svg" loading="lazy" class="illustration time-illu"/>
                          <div class="block-text-wrapper"><h3 class="h3 block-title small">Power up</h3><p class="body-m block-description small">You came for coffee. You left with a cinnamon bun. Excellent decision.</p></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- Time 3 -->
                  <div data-w-tab="2" class="w-tab-pane">
                    <div class="time-wrapper-content">
                      <div class="name"><div class="handwritten-l opacity">03</div><div class="handwritten-l">Afternoon refresh</div></div>
                      <div class="time-wrapper-info">
                        <div class="time"><div class="display-l">14</div><div class="display-l white">:</div><div class="display-l">47</div></div>
                        <div class="illustration-and-text">
                          <img src="${base}6a75b09837a7ee658908b74b_Illustration 12.svg" loading="lazy" class="illustration time-illu"/>
                          <div class="block-text-wrapper"><h3 class="h3 block-title small">Iced o’clock</h3><p class="body-m block-description small">The inbox is winning. Matcha enters the chat and turns things around.</p></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- Time 4 -->
                  <div data-w-tab="3" class="w-tab-pane">
                    <div class="time-wrapper-content">
                      <div class="name"><div class="handwritten-l opacity">04</div><div class="handwritten-l">Treat time</div></div>
                      <div class="time-wrapper-info">
                        <div class="time"><div class="display-l">17</div><div class="display-l white">:</div><div class="display-l">31</div></div>
                        <div class="illustration-and-text">
                          <img src="${base}6a75b097b6f439f22a81f66c_Illustration 13.svg" loading="lazy" class="illustration time-illu"/>
                          <div class="block-text-wrapper"><h3 class="h3 block-title small">One more?</h3><p class="body-m block-description small">One last espresso before home. Good days deserve a strong finish.</p></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="time-tabs w-tab-menu">
                  <a data-time-tab="0" class="time-tab w-inline-block w--current">
                    <div class="time-name"><div class="handwritten-s">07:03</div><div class="display-s">First sip</div></div>
                    <img src="${base}6a75b023d8015a210ca4c6c2_Illustration 4.svg" loading="lazy" class="illustration time-tab-illu"/>
                  </a>
                  <a data-time-tab="1" class="time-tab w-inline-block">
                    <div class="time-name"><div class="handwritten-s">10:12</div><div class="display-s">Power up</div></div>
                    <img src="${base}6a75b023198e4093e6caeb01_Illustration 11.svg" loading="lazy" class="illustration time-tab-illu"/>
                  </a>
                  <a data-time-tab="2" class="time-tab w-inline-block">
                    <div class="time-name"><div class="handwritten-s">14:47</div><div class="display-s">Iced o’clock</div></div>
                    <img src="${base}6a75b023fa260d1b0e5d6869_Illustration 12.svg" loading="lazy" class="illustration time-tab-illu"/>
                  </a>
                  <a data-time-tab="3" class="time-tab w-inline-block">
                    <div class="time-name"><div class="handwritten-s">17:31</div><div class="display-s">One more?</div></div>
                    <img src="${base}6a75b023198e4093e6caeafc_Illustration 13.svg" loading="lazy" class="illustration time-tab-illu"/>
                  </a>
                </div>
              </div>
              <img src="${base}6a75b023aeb595f44c2ceb11_Illustration 9.svg" loading="lazy" width="Auto" height="Auto" alt="" class="illustration time-arrow-illu"/>
              <div class="btn-wrapper">
                ${anchor('menu', '<div class="button-border"></div><div class="button-background"></div><div class="emphasis-l top-index">Explore the menu</div>', 'button w-inline-block')}
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Philosophy & Receipt -->
      ${renderPhilosophy()}

      ${renderTicker()}

      <!-- Atmosphere / Seating Spots -->
      ${renderAtmosphere()}

      <!-- Testimonials -->
      ${renderTestimonials()}

      <!-- Visit Section Bento -->
      ${renderVisit()}
    `;
  }

  if (page === 'catalog') {
    mainContent = `
      <section class="section top-padd" data-wr-hero>
        <div class="w-layout-blockcontainer container w-container">
          <div class="section-heading default" style="text-align:center">
            <div class="label" style="justify-content:center"><div class="circle"></div><div class="handwritten-l">Daily fresh bakes & brews</div></div>
            <h1 class="h1 hero-h1">The complete ${esc(name)} menu</h1>
            <p class="body-l secton-description" style="margin:20px auto;max-width:640px">Specialty roasts, layered ceremonial matcha, and butter-rich pastries made fresh every morning.</p>
          </div>
          <div class="mello-catalog-search">
            <input type="search" placeholder="Search coffee, drinks, or bakes..." data-mello-search aria-label="Search the menu">
          </div>
          <div class="mello-filter-pills">
            <button class="mello-filter-pill active" data-filter="all">All Items</button>
            <button class="mello-filter-pill" data-filter="Espresso bar">Espresso bar</button>
            <button class="mello-filter-pill" data-filter="Coffee favorites">Coffee favorites</button>
            <button class="mello-filter-pill" data-filter="Matcha & tea">Matcha & tea</button>
            <button class="mello-filter-pill" data-filter="Cold drinks">Cold drinks</button>
            <button class="mello-filter-pill" data-filter="Blended favorites">Blended favorites</button>
            <button class="mello-filter-pill" data-filter="Bakes & bites">Bakes & bites</button>
          </div>
          <div class="menu-blocks" style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:24px">
            ${(products.length ? products : melloExampleProducts()).map(p => {
              const tp = translateProduct(p);
              const imgUrl = asset(p.imageAssetId) || base + '6a75afbad8015a210ca48519_Cold matcha.avif';
              return `
                <article class="mello-card" data-category="${esc(p.material || 'Specialty')}" style="background:var(--white);border:3px solid var(--black);border-radius:var(--_sizes---main-radius);overflow:hidden;box-shadow:4px 4px 0 var(--black);display:flex;flex-direction:column">
                  <div style="height:220px;overflow:hidden;background:var(--accent);position:relative">
                    <img src="${esc(imgUrl)}" alt="${esc(tp.name)}" style="width:100%;height:100%;object-fit:cover" loading="lazy">
                    ${p.dimensions ? `<div style="position:absolute;top:14px;right:14px;background:var(--black);color:var(--white);padding:4px 10px;border-radius:999px;font-size:12px;font-weight:700">${esc(p.dimensions)}</div>` : ''}
                  </div>
                  <div style="padding:20px;flex:1;display:flex;flex-direction:column">
                    <h3 class="h3 h3-small" style="margin-bottom:8px">${esc(tp.name)}</h3>
                    <p class="body-m" style="color:var(--black-opacity--80);flex:1;margin-bottom:16px">${esc(tp.description)}</p>
                    <div style="display:flex;justify-content:space-between;align-items:center;border-top:2px solid var(--black-opacity--10);padding-top:14px">
                      <div class="emphasis-l" style="color:var(--black)">$4.50 – $6.50</div>
                      ${route('detail', 'View details ↗', 'mello-filter-pill', p.id)}
                    </div>
                  </div>
                </article>
              `;
            }).join('')}
          </div>
        </div>
      </section>
      ${renderCompleteMenu()}
      ${renderVisit()}
    `;
  }

  if (page === 'detail') {
    const p = products.find(p => p.id === options.productId) || (isDemo ? melloExampleProducts().find(p => p.id === options.productId) || melloExampleProducts()[0] : undefined);
    if (!p) {
      mainContent = `
        <section class="section top-padd" data-wr-hero>
          <div class="w-layout-blockcontainer container w-container" style="text-align:center;padding:80px 20px">
            <h1 class="h1 hero-h1">Menu item not found</h1>
            <p class="body-l" style="margin:20px auto 32px">We couldn't find the drink or bakery item you're looking for.</p>
            ${route('catalog', '← Back to full menu', 'button w-inline-block')}
          </div>
        </section>
      `;
    } else {
      const tp = translateProduct(p);
      const imgUrl = asset(p.imageAssetId) || base + '6a75afbad8015a210ca48519_Cold matcha.avif';
      const gallery = (p.gallery || []).filter(g => asset(g.assetId));
      mainContent = `
        <section class="section top-padd" data-wr-hero>
          <div class="w-layout-blockcontainer container w-container">
            <div style="margin-bottom:32px">
              ${route('catalog', '← Back to full menu', 'button w-inline-block')}
            </div>
            <div class="mello-detail-grid">
              <div class="mello-detail-image">
                <img id="wr-detail-main-img" src="${esc(imgUrl)}" alt="${esc(tp.name)}" fetchpriority="high">
                ${gallery.length ? `
                  <div class="mello-gallery" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(90px,1fr));gap:12px;margin-top:16px">
                    ${gallery.map(g => `
                      <img src="${esc(asset(g.assetId))}" alt="${esc(g.caption || tp.name)}" style="width:100%;aspect-ratio:1;object-fit:cover;border-radius:12px;border:2px solid var(--black);cursor:pointer" loading="lazy">
                    `).join('')}
                  </div>
                ` : ''}
              </div>
              <div class="mello-detail-info">
                <div class="label"><div class="circle"></div><div class="handwritten-l">${esc(p.material || 'Specialty creation')}</div></div>
                <h1 class="h1 hero-h1" style="font-size:clamp(44px,6vw,72px)">${esc(tp.name)}</h1>
                <div class="mello-detail-price">$5.50 – $6.50</div>
                <p class="body-l" style="font-size:20px;line-height:1.5">${esc(tp.description)}</p>
                ${p.sellingPoints?.length ? `
                  <div style="border-top:2px solid var(--black-opacity--10);border-bottom:2px solid var(--black-opacity--10);padding:20px 0">
                    <div class="handwritten-s opacity" style="margin-bottom:12px">Highlights & Ingredients</div>
                    <ul style="padding-left:20px;margin:0;display:flex;flex-direction:column;gap:8px">
                      ${p.sellingPoints.map(pt => `<li class="body-m" style="font-weight:700">✓ ${esc(pt)}</li>`).join('')}
                    </ul>
                  </div>
                ` : ''}
                <div style="display:flex;gap:16px;align-items:center;flex-wrap:wrap;margin-top:12px">
                  ${route('contact', '<div class="button-border"></div><div class="button-background"></div><div class="emphasis-l top-index">Order for pickup / Enquiry ↗</div>', 'button w-inline-block', p.id)}
                  ${anchor('menu', '<div class="button-border"></div><div class="button-background"></div><div class="emphasis-l top-index">Explore other drinks</div>', 'button w-variant-c95095ce-7382-225f-41af-d39d3577dbad w-inline-block')}
                </div>
              </div>
            </div>
          </div>
        </section>
        ${renderCompleteMenu()}
      `;
    }
  }

  if (page === 'about') {
    mainContent = `
      <section class="section top-padd" data-wr-hero>
        <div class="w-layout-blockcontainer container w-container">
          <div class="section-heading default" style="text-align:center">
            <div class="label" style="justify-content:center"><div class="circle"></div><div class="handwritten-l">About ${esc(name)}</div></div>
            <h1 class="h1 hero-h1">${esc(c.aboutHeadline || 'A brighter kind of coffee break')}</h1>
            <p class="body-l secton-description" style="margin:20px auto;max-width:720px">
              ${esc(copy?.about || c.aboutStory || c.description || 'We started Mello to make specialty coffee feel less serious and a lot more human. Good coffee, cold matcha, fresh pastries, and genuine smiles.')}
            </p>
          </div>
        </div>
      </section>
      ${renderPhilosophy()}
      ${renderAtmosphere()}
      ${renderTestimonials()}
      ${renderVisit()}
    `;
  }

  if (page === 'contact') {
    mainContent = `
      <section class="section top-padd" data-wr-hero>
        <div class="w-layout-blockcontainer container w-container">
          <div class="section-heading default">
            <div class="label"><div class="circle"></div><div class="handwritten-l">Come on over</div></div>
            <h1 class="h1 hero-h1">Say hello & visit ${esc(name)}</h1>
            <p class="body-l secton-description">Have a question about our menu, catering, or want to say hi? Drop us a note below.</p>
          </div>
          <div class="mello-contact-layout">
            <div>
              <div class="hours-block" style="margin-bottom:24px">
                <div class="block-text-wrapper small">
                  <div class="handwritten-s">Operating hours</div>
                  <h3 class="h3 h3-small">${esc(hours)}</h3>
                </div>
                <img src="${base}6a75b02324f6b52c0c3d3a94_Illustration 22.svg" loading="lazy" class="illustration hours-block-illu"/>
              </div>
              <div class="location-block" style="display:block;margin-bottom:24px">
                <div class="location-info">
                  <div class="handwritten-s">${esc(name)}’s Roastery</div>
                  <h3 class="h3 h3-small block-text">${esc(address)}</h3>
                  ${c.phone ? `<p class="body-m" style="margin-top:10px">Phone: <a href="tel:${esc(c.phone.replace(/[^+\d]/g, ''))}"><strong>${esc(c.phone)}</strong></a></p>` : ''}
                </div>
              </div>
              <div class="photo-block" style="border-radius:var(--_sizes---main-radius);overflow:hidden;border:3px solid var(--black)">
                <img src="${base}6a75afba37a7ee658908211b_Coffee Shop.avif" alt="Cafe view" style="width:100%;height:260px;object-fit:cover">
              </div>
            </div>
            <div class="mello-form-card">
              <h2 class="h3 h3-small" style="margin-bottom:12px">Send an enquiry / request</h2>
              <p class="body-m" style="color:var(--black-opacity--80);margin-bottom:24px">We read every message and get back to you within one business day.</p>
              ${ctx.inquiryFormHtml}
            </div>
          </div>
        </div>
      </section>
      ${renderVisit()}
    `;
  }

  // Header Nav
  const logoContent = c.logoAssetId ? ctx.brandLogo : `<div class="logo-font">${esc(name)}</div>`;
  const infoBar = `
    <div class="info-bar">
      <div class="info-bar-content-wrapper">
        <div class="info-bar-content first">
          <div class="body-m x">${esc(address)}</div>
          <img width="Auto" height="Auto" alt="" src="${base}6a75b023c32121ab710aeb37_Illustration 1.svg" loading="lazy" class="icon info-bar-icon"/>
          <div class="body-m x">${esc(hours)}</div>
          <img width="Auto" height="Auto" alt="" src="${base}6a75b023c32121ab710aeb37_Illustration 1.svg" loading="lazy" class="icon info-bar-icon"/>
          <div class="body-m x">Coffee, matcha &amp; fresh bakes daily</div>
          <img width="Auto" height="Auto" alt="" src="${base}6a75b023c32121ab710aeb37_Illustration 1.svg" loading="lazy" class="icon info-bar-icon"/>
        </div>
        <div class="info-bar-content second">
          <div class="body-m x">${esc(address)}</div>
          <img width="Auto" height="Auto" alt="" src="${base}6a75b023c32121ab710aeb37_Illustration 1.svg" loading="lazy" class="icon info-bar-icon"/>
          <div class="body-m x">${esc(hours)}</div>
          <img width="Auto" height="Auto" alt="" src="${base}6a75b023c32121ab710aeb37_Illustration 1.svg" loading="lazy" class="icon info-bar-icon"/>
          <div class="body-m x">Coffee, matcha &amp; fresh bakes daily</div>
          <img width="Auto" height="Auto" alt="" src="${base}6a75b023c32121ab710aeb37_Illustration 1.svg" loading="lazy" class="icon info-bar-icon"/>
        </div>
      </div>
    </div>
  `;

  return `
    <a class="pg-skip" href="#main" style="position:fixed;top:-100px;left:20px;background:#fff;padding:12px;z-index:999" onfocus="this.style.top='10px'" onblur="this.style.top='-100px'">Skip to content</a>
    <nav class="header">
      ${infoBar}
      <div class="menu">
        <div class="w-layout-blockcontainer container w-container">
          <div class="menu-content">
            <a href="${path('index.html')}" ${navAttrs('home')} class="logo w-inline-block ${page === 'home' ? 'w--current' : ''}">
              ${logoContent}
            </a>
            <div class="menu-links" data-wr-mobile-menu>
              ${page === 'home' ? `
                <a href="#menu" class="menu-link w-inline-block"><div class="emphasis-l">Menu</div><div class="link-background"></div></a>
                <a href="#place" class="menu-link w-inline-block"><div class="emphasis-l">Place</div><div class="link-background"></div></a>
                <a href="#visit" class="menu-link w-inline-block"><div class="emphasis-l">Visit</div><div class="link-background"></div></a>
              ` : `
                ${route('catalog', '<div class="emphasis-l">Menu</div><div class="link-background"></div>', 'menu-link w-inline-block')}
                ${route('about', '<div class="emphasis-l">Place</div><div class="link-background"></div>', 'menu-link w-inline-block')}
                ${route('contact', '<div class="emphasis-l">Visit</div><div class="link-background"></div>', 'menu-link w-inline-block')}
              `}
            </div>
            ${draft.languages.length > 1 ? `<div style="margin-left:auto;display:flex;gap:8px;font-size:12px;font-weight:700">${ctx.languageLinks}</div>` : ''}
          </div>
        </div>
      </div>
    </nav>
    <main id="main">
      ${mainContent}
    </main>
    <footer class="footer">
      <div class="w-layout-blockcontainer container w-container">
        <div class="footer-content">
          <div class="footer-info">
            <div class="footer-info-text">
              <a href="${path('index.html')}" class="logo w-inline-block"><div class="logo-font">${esc(name)}</div></a>
              <div class="handwritten-l">${esc(hours)}</div>
              <img width="Auto" height="Auto" alt="" src="${base}6a75b098766be2add116e6ef_Illustration 25.svg" loading="lazy" class="illustration footer-logo-illu"/>
            </div>
            <div class="text-and-links">
              <p class="body-m">© ${new Date().getUTCFullYear()} ${esc(name)}. ${esc(ctx.ui.rights || 'All rights reserved')}</p>
              <div class="links-wrapper">
                <div class="links">
                  ${route('catalog', '<div class="emphasis-m">Menu</div>', 'link w-inline-block')}
                  ${route('about', '<div class="emphasis-m">About</div>', 'link w-inline-block')}
                  ${route('contact', '<div class="emphasis-m">Contact</div>', 'link w-inline-block')}
                </div>
              </div>
            </div>
          </div>
          <div class="footer-menu">
            <div class="footer-menu small">
              <div class="menu-block">
                <div class="handwritten-s opacity">Explore</div>
                <div class="footer-links">
                  ${anchor('menu', '<div class="display-s">Menu</div>', 'footer-link w-inline-block')}
                  ${anchor('place', '<div class="display-s">Place</div>', 'footer-link w-inline-block')}
                  ${anchor('visit', '<div class="display-s">Visit</div>', 'footer-link w-inline-block')}
                </div>
              </div>
              <div class="menu-block">
                <div class="handwritten-s opacity">Follow</div>
                <div class="footer-links">
                  <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" class="footer-link w-inline-block"><div class="display-s">TikTok</div></a>
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" class="footer-link w-inline-block"><div class="display-s">Instagram</div></a>
                  <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" class="footer-link w-inline-block"><div class="display-s">Facebook</div></a>
                </div>
              </div>
            </div>
            <div class="menu-block">
              <div class="handwritten-s opacity">Contact</div>
              <div class="footer-links">
                <a href="https://google.com/maps" target="_blank" class="footer-link w-inline-block">
                  <div class="f-link-icon-wrapper"><img src="${base}6a75aff0c4b98d47b861317a_MapPin.svg" alt="" class="icon f-link-icon"/></div>
                  <div class="display-s">${esc(address)}</div>
                </a>
                <a href="mailto:${esc(email)}" class="footer-link w-inline-block">
                  <div class="f-link-icon-wrapper"><img src="${base}6a75aff09447c62856a96820_EnvelopeSimple.svg" alt="" class="icon f-link-icon"/></div>
                  <div class="display-s">${esc(email)}</div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  `;
}

export function melloRuntime(): void {
  // 1. Mood wheel
  const wheelBlocks = document.querySelectorAll<HTMLElement>('[data-mood]');
  const wheelArrow = document.querySelector<HTMLElement>('.wheel-arrow');
  const prodCards = document.querySelectorAll<HTMLElement>('[data-prod-card]');
  wheelBlocks.forEach(wb => {
    wb.addEventListener('click', () => {
      const idx = wb.getAttribute('data-mood');
      const deg = wb.getAttribute('data-deg') || '-45';
      wheelBlocks.forEach(b => b.classList.remove('active'));
      wb.classList.add('active');
      if (wheelArrow) {
        wheelArrow.style.transform = `rotate(${deg}deg)`;
      }
      prodCards.forEach(card => {
        card.classList.toggle('active', card.getAttribute('data-prod-card') === idx);
      });
    });
  });

  // 2. Coffee O'Clock Time Tabs
  const timeTabs = document.querySelectorAll<HTMLElement>('[data-time-tab]');
  const timePanes = document.querySelectorAll<HTMLElement>('[data-mello-time] .w-tab-pane');
  timeTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      const idx = tab.getAttribute('data-time-tab');
      timeTabs.forEach(t => t.classList.remove('w--current'));
      tab.classList.add('w--current');
      timePanes.forEach(pane => {
        pane.classList.toggle('w--tab-active', pane.getAttribute('data-w-tab') === idx);
      });
    });
  });

  // 3. Atmosphere Seating Spot Tabs & Hotspots
  const spotTabs = document.querySelectorAll<HTMLElement>('[data-spot-btn]');
  const spotHotspots = document.querySelectorAll<HTMLElement>('[data-spot-idx]');
  const spotPanes = document.querySelectorAll<HTMLElement>('[data-mello-spot] .w-tab-pane');
  const setSpot = (idx: string) => {
    spotTabs.forEach(tab => tab.classList.toggle('w--current', tab.getAttribute('data-spot-btn') === idx));
    spotPanes.forEach(pane => pane.classList.toggle('w--tab-active', pane.getAttribute('data-w-tab') === idx));
    document.querySelectorAll('.hotspot').forEach(h => h.classList.remove('active'));
    document.querySelectorAll(`[data-spot-idx="${idx}"] .hotspot`).forEach(h => h.classList.add('active'));
  };
  spotTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      const idx = tab.getAttribute('data-spot-btn') || '0';
      setSpot(idx);
    });
  });
  spotHotspots.forEach(hs => {
    hs.addEventListener('click', () => {
      const idx = hs.getAttribute('data-spot-idx') || '0';
      setSpot(idx);
    });
  });

  // 4. Testimonials Slider
  const slides = document.querySelectorAll<HTMLElement>('[data-slide-index]');
  const dots = document.querySelectorAll<HTMLElement>('[data-dot]');
  let curSlide = 0;
  const showSlide = (i: number) => {
    curSlide = (i + slides.length) % slides.length;
    slides.forEach((s, idx) => s.classList.toggle('active', idx === curSlide));
    dots.forEach((d, idx) => d.classList.toggle('w-active', idx === curSlide));
  };
  document.querySelector('[data-slider-prev]')?.addEventListener('click', () => showSlide(curSlide - 1));
  document.querySelector('[data-slider-next]')?.addEventListener('click', () => showSlide(curSlide + 1));
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const idx = parseInt(dot.getAttribute('data-dot') || '0', 10);
      showSlide(idx);
    });
  });
  setInterval(() => {
    showSlide(curSlide + 1);
  }, 5000);

  // 5. Catalog Search & Filter
  const searchInput = document.querySelector<HTMLInputElement>('[data-mello-search]');
  const filterPills = document.querySelectorAll<HTMLElement>('.mello-filter-pill[data-filter]');
  const cards = document.querySelectorAll<HTMLElement>('.mello-card');
  const applyCatalogFilter = () => {
    const query = searchInput?.value.trim().toLowerCase() || '';
    const activeFilter = document.querySelector('.mello-filter-pill.active')?.getAttribute('data-filter') || 'all';
    cards.forEach(card => {
      const text = card.textContent?.toLowerCase() || '';
      const cat = card.getAttribute('data-category') || '';
      const matchQuery = !query || text.includes(query);
      const matchCat = activeFilter === 'all' || cat.includes(activeFilter);
      card.style.display = matchQuery && matchCat ? '' : 'none';
    });
  };
  searchInput?.addEventListener('input', applyCatalogFilter);
  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      applyCatalogFilter();
    });
  });
}
