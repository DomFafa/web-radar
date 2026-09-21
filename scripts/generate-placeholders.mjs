import fs from 'fs';
import path from 'path';

const outDir = path.resolve('public/templates/placeholders');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const templates = [
  // 1. Toys & Figures (Cyber, Neon, Mecha, Vinyl)
  {
    prefix: 'toys',
    items: [
      { name: 'Mecha Stryker VII', color1: '#6366f1', color2: '#a855f7', icon: '🤖', type: 'DIECAST MECHA' },
      { name: 'Neon Kaiju Sofubi', color1: '#ec4899', color2: '#f43f5e', icon: '🦖', type: 'VINYL ART TOY' },
      { name: 'Cyber Samurai 1/6', color1: '#8b5cf6', color2: '#3b82f6', icon: '⚔️', type: 'RESIN STATUE' },
      { name: 'Astro Explorer Pup', color1: '#06b6d4', color2: '#3b82f6', icon: '🚀', type: 'BLINDBOX FIGURE' },
      { name: 'Titan Mech Walker', color1: '#3b82f6', color2: '#1d4ed8', icon: '🛡️', type: 'ALLOY ROBOT' },
      { name: 'Retro Pixel Warrior', color1: '#10b981', color2: '#06b6d4', icon: '👾', type: 'PIXEL COLLECTIBLE' },
      { name: 'Ghost Ronin Cyber', color1: '#d946ef', color2: '#8b5cf6', icon: '🎭', type: 'LIMITED EDITION' },
      { name: 'Steampunk Automaton', color1: '#f59e0b', color2: '#d97706', icon: '⚙️', type: 'BRASS ART TOY' },
    ],
  },
  // 2. Footwear & Shoes (High-tech, Speed, Biomechanics)
  {
    prefix: 'footwear',
    items: [
      { name: 'Carbon Racer Pro', color1: '#0ea5e9', color2: '#2563eb', icon: '👟', type: 'CARBON MARATHON' },
      { name: 'Vibram Trail Grip', color1: '#059669', color2: '#10b981', icon: '🥾', type: 'ALL-TERRAIN TRAIL' },
      { name: 'Goodyear Oxford', color1: '#d97706', color2: '#78350f', icon: '👞', type: 'HERITAGE WELTED' },
      { name: 'Supercritical Foam', color1: '#06b6d4', color2: '#0284c7', icon: '⚡', type: 'KINETIC CUSHION' },
      { name: 'Hydro Slides 3D', color1: '#6366f1', color2: '#4f46e5', icon: '🩴', type: 'RECOVERY SLIDE' },
      { name: 'GORE-TEX Explorer', color1: '#475569', color2: '#0f172a', icon: '🏔️', type: 'WEATHERPROOF BOOT' },
      { name: 'WholeKnit Stealth', color1: '#1e293b', color2: '#0f172a', icon: '🏃', type: 'SEAMLESS ATHLETIC' },
      { name: 'Artisan Derby Shoe', color1: '#b45309', color2: '#92400e', icon: '✨', type: 'CALFSKIN LEATHER' },
    ],
  },
  // 3. Apparel & Textile (High Fashion, Editorial, Draping)
  {
    prefix: 'apparel',
    items: [
      { name: '3L StormShell Parka', color1: '#b45309', color2: '#d97706', icon: '🧥', type: 'WATERPROOF 3L' },
      { name: 'Merino 3D Knitwear', color1: '#475569', color2: '#1e293b', icon: '🧶', type: 'WHOLEGARMENT WOOL' },
      { name: 'Mulberry Silk Trench', color1: '#f59e0b', color2: '#b45309', icon: '✨', type: 'RUNWAY SILK' },
      { name: '460GSM Vintage Hoodie', color1: '#64748b', color2: '#334155', icon: '👕', type: 'FRENCH TERRY' },
      { name: 'Bamboo Charcoal Tee', color1: '#059669', color2: '#065f46', icon: '🌿', type: 'ANTI-ODOR ACTIVE' },
      { name: '14oz Selvedge Denim', color1: '#1e3a8a', color2: '#172554', icon: '👖', type: 'RAW INDIGO DENIM' },
      { name: 'French Linen Shirt', color1: '#d97706', color2: '#92400e', icon: '🪡', type: 'ORGANIC FLAX' },
      { name: 'Bonded ThermoCore', color1: '#0f172a', color2: '#334155', icon: '❄️', type: 'SEAMLESS BASE' },
    ],
  },
  // 4. Plush & Cushions (Soft, Warm, Comfort, Organic)
  {
    prefix: 'plush',
    items: [
      { name: 'Velvet Hug Bear', color1: '#ec4899', color2: '#db2777', icon: '🧸', type: 'BABY-SAFE PLUSH' },
      { name: 'Ergo Lumbar Cushion', color1: '#f43f5e', color2: '#be123c', icon: '☁️', type: 'MEMORY FOAM' },
      { name: 'Sensory Sloth Pillow', color1: '#fb7185', color2: '#e11d48', icon: '🦥', type: 'SENSORY CALM' },
      { name: 'Organic Cloud Pouf', color1: '#fda4af', color2: '#f43f5e', icon: '🛋️', type: 'ORGANIC COTTON' },
      { name: 'Contour Cervical Pad', color1: '#e11d48', color2: '#9f1239', icon: '💤', type: 'ORTHOPEDIC REST' },
      { name: 'Giant Alpaca Lounger', color1: '#f472b6', color2: '#db2777', icon: '🦙', type: 'SUPER-SOFT FAUX' },
      { name: 'Micro-Glass Blanket', color1: '#fb7185', color2: '#be123c', icon: '🛌', type: 'WEIGHTED RELIEF' },
      { name: 'Fluffy Lop Bunny', color1: '#f43f5e', color2: '#881337', icon: '🐰', type: 'SILKY SHERPA' },
    ],
  },
  // 5. Universal Trade (B2B Multi-Industry, Hardware, Tech, Lifestyle)
  {
    prefix: 'universal',
    items: [
      { name: '140W GaN Power Hub', color1: '#0284c7', color2: '#2563eb', icon: '⚡', type: 'GAN III CHARGER' },
      { name: 'Aluminum Carry-on 20"', color1: '#475569', color2: '#0f172a', icon: '🧳', type: '6063 ALLOY FRAME' },
      { name: 'Zirconia Chef Knives', color1: '#0ea5e9', color2: '#0369a1', icon: '🔪', type: 'CERAMIC CUTLERY' },
      { name: 'SUS304 Thermal Flask', color1: '#0284c7', color2: '#1d4ed8', icon: '🍶', type: 'DOUBLE-WALL VACUUM' },
      { name: 'Modular Desk Lamp', color1: '#38bdf8', color2: '#0284c7', icon: '💡', type: 'CRI95+ ARCHITECT' },
      { name: 'Ergo Mesh Lumbar Chair', color1: '#334155', color2: '#0f172a', icon: '💺', type: 'GERMAN MESH' },
      { name: 'Sonic Oral Station', color1: '#06b6d4', color2: '#0284c7', icon: '🪥', type: '48,000 VPM IPX8' },
      { name: '840D Tactical Duffel', color1: '#1e293b', color2: '#0284c7', icon: '🎒', type: 'SUBMERSIBLE TPU' },
    ],
  },
];

for (const cat of templates) {
  cat.items.forEach((item, idx) => {
    const filename = `${cat.prefix}-${idx + 1}.svg`;
    const filepath = path.join(outDir, filename);

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#e2e8f0"/>
    </linearGradient>
    <linearGradient id="orbGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${item.color1}"/>
      <stop offset="100%" stop-color="${item.color2}"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="35" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
    <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="${item.color2}" flood-opacity="0.22"/>
    </filter>
  </defs>

  <!-- Clean Canvas Background -->
  <rect width="600" height="600" rx="36" fill="url(#bgGrad)"/>

  <!-- Subtle Blueprint Tech Grid -->
  <g opacity="0.12" stroke="#475569" stroke-width="1">
    <line x1="60" y1="0" x2="60" y2="600"/>
    <line x1="180" y1="0" x2="180" y2="600"/>
    <line x1="300" y1="0" x2="300" y2="600"/>
    <line x1="420" y1="0" x2="420" y2="600"/>
    <line x1="540" y1="0" x2="540" y2="600"/>
    <line x1="0" y1="60" x2="600" y2="600"/>
    <line x1="0" y1="180" x2="600" y2="180"/>
    <line x1="0" y1="300" x2="600" y2="300"/>
    <line x1="0" y1="420" x2="600" y2="420"/>
    <line x1="0" y1="540" x2="600" y2="540"/>
  </g>

  <!-- Ambient Radiant Spotlight -->
  <circle cx="300" cy="270" r="180" fill="url(#orbGrad)" opacity="0.18" filter="url(#glow)"/>

  <!-- Concentric Precision Geometry Ring -->
  <circle cx="300" cy="270" r="160" fill="none" stroke="${item.color1}" stroke-width="2" stroke-dasharray="8 6" opacity="0.4"/>
  <circle cx="300" cy="270" r="130" fill="none" stroke="${item.color2}" stroke-width="1.5" opacity="0.5"/>

  <!-- Glass Podium Center Shield -->
  <rect x="140" y="110" width="320" height="320" rx="28" fill="#ffffff" fill-opacity="0.88" stroke="#ffffff" stroke-width="2" filter="url(#cardShadow)"/>

  <!-- Category Tag Pill -->
  <g transform="translate(300, 160)">
    <rect x="-85" y="-14" width="170" height="28" rx="14" fill="${item.color1}" fill-opacity="0.12"/>
    <text x="0" y="5" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="900" fill="${item.color1}" text-anchor="middle" letter-spacing="1.5">${item.type}</text>
  </g>

  <!-- Main Central Icon Symbol -->
  <text x="300" y="295" font-size="92" text-anchor="middle" dominant-baseline="central">${item.icon}</text>

  <!-- Product Title Under Symbol -->
  <text x="300" y="380" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="17" font-weight="900" fill="#0f172a" text-anchor="middle">${item.name}</text>

  <!-- Technical Spec Details -->
  <g transform="translate(300, 500)" text-anchor="middle">
    <rect x="-160" y="-22" width="320" height="44" rx="12" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
    <text x="0" y="5" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#334155" letter-spacing="0.5">OEM / ODM HIGH-GRADE EXPORT SPEC</text>
  </g>

  <!-- Export Grade Seal -->
  <circle cx="510" cy="90" r="32" fill="${item.color2}"/>
  <text x="510" y="86" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="900" fill="#ffffff" text-anchor="middle">QC</text>
  <text x="510" y="100" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="9" font-weight="800" fill="#ffffff" text-anchor="middle">PASS</text>
</svg>`;

    fs.writeFileSync(filepath, svg);
  });
}

console.log('Successfully generated 40 distinct industry vector placeholders!');
