export const singleProductStyles = `
/* ==========================================================================
   Single Product Showcase Templates — 100% Light Themed, Distinct Layouts
   ========================================================================== */

/* Base Design Tokens (Default: Keynote Hardware Stage) */
.sp-site {
  --sp-bg: #f8fafc;
  --sp-surface: #ffffff;
  --sp-surface-subtle: #f1f5f9;
  --sp-ink: #0f172a;
  --sp-muted: #64748b;
  --sp-line: #e2e8f0;
  --sp-accent: #0284c7;
  --sp-accent-ink: #ffffff;
  background: var(--sp-bg);
  color: var(--sp-ink);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  overflow-wrap: anywhere;
  font-size: 16px;
  line-height: 1.6;
}
.sp-site * { box-sizing: border-box; }
.sp-site a { color: inherit; text-decoration: none; }
.sp-site p { color: var(--sp-muted); line-height: 1.7; margin: 0 0 16px; }
.sp-site h1, .sp-site h2, .sp-site h3, .sp-site h4 {
  color: var(--sp-ink);
  font-family: inherit;
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.15;
  margin: 0;
}
.sp-site h1 { font-size: clamp(38px, 5.5vw, 76px); }
.sp-site h2 { font-size: clamp(28px, 3.8vw, 48px); }
.sp-site h3 { font-size: clamp(20px, 2.4vw, 32px); }
.sp-site h4 { font-size: 18px; }
.sp-site figure { margin: 0; }
.sp-site img { display: block; width: 100%; object-fit: cover; }
.sp-site button, .sp-site input, .sp-site select, .sp-site textarea { font: inherit; }
.sp-site :focus-visible { outline: 3px solid var(--sp-accent); outline-offset: 4px; }

/* Header & Navigation */
.sp-header {
  min-height: 84px;
  padding: 16px 5%;
  display: flex;
  align-items: center;
  gap: 32px;
  border-bottom: 1px solid var(--sp-line);
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(14px);
  position: sticky;
  top: 0;
  z-index: 80;
}
.sp-brand {
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--sp-ink);
}
.sp-brand img { width: auto; max-height: 42px; max-width: 160px; object-fit: contain; }
.sp-header nav { display: flex; gap: 28px; margin: auto; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; }
.sp-header nav a { color: var(--sp-muted); transition: color 0.2s ease; }
.sp-header nav a:hover, .sp-header nav a[aria-current=page] { color: var(--sp-accent); border-bottom: 2px solid var(--sp-accent); padding-bottom: 4px; }
.sp-languages { display: flex; gap: 10px; font-size: 12px; font-weight: 600; }
.sp-kicker {
  display: inline-block;
  font-size: 11px;
  letter-spacing: 0.16em;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--sp-accent);
  margin-bottom: 16px;
}
.sp-site .sp-lead { font-size: 19px; line-height: 1.6; max-width: 620px; color: var(--sp-muted); margin: 20px 0 32px; }

/* Buttons & Links */
.sp-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  border: 1px solid var(--sp-accent);
  padding: 14px 28px;
  border-radius: 6px;
  background: var(--sp-accent);
  color: var(--sp-accent-ink) !important;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.02em;
  box-shadow: 0 4px 14px rgba(2, 132, 199, 0.2);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.sp-button:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(2, 132, 199, 0.28); }
.sp-secondary { background: #ffffff; color: var(--sp-ink) !important; border: 1px solid var(--sp-line); box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
.sp-secondary:hover { background: var(--sp-surface-subtle); box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
.sp-actions { display: flex; align-items: center; gap: 20px; flex-wrap: wrap; margin-top: 12px; }
.sp-text-link { font-size: 14px; font-weight: 700; color: var(--sp-accent); border-bottom: 1px solid currentColor; padding-bottom: 2px; }

/* Sections */
.sp-section { padding: 88px 6%; max-width: 1400px; margin: auto; }
.sp-section-heading { margin-bottom: 48px; }
.sp-section-heading h2 { margin-top: 8px; }
.sp-split { display: grid; grid-template-columns: 1fr 1fr; align-items: center; gap: 60px; }
.sp-product-photo { background: var(--sp-surface); border: 1px solid var(--sp-line); border-radius: 16px; padding: 36px; box-shadow: 0 12px 36px rgba(15, 23, 42, 0.04); text-align: center; }
.sp-site .sp-product-photo img { height: auto; max-height: 460px; aspect-ratio: 1/1; object-fit: contain; margin: 0 auto; filter: drop-shadow(0 12px 24px rgba(15,23,42,0.08)); }
.sp-site figcaption { font-size: 12px; font-weight: 600; letter-spacing: 0.05em; color: var(--sp-muted); margin-top: 16px; text-transform: uppercase; }
.sp-no-photo { display: grid; place-items: center; min-height: 320px; background: var(--sp-surface-subtle); border: 1px dashed var(--sp-line); border-radius: 12px; color: var(--sp-muted); font-weight: 600; }

/* Facts & Specifications Table */
.sp-facts { margin: 24px 0 32px; border-top: 1px solid var(--sp-line); }
.sp-facts > div { display: grid; grid-template-columns: 140px 1fr; gap: 16px; padding: 14px 0; border-bottom: 1px solid var(--sp-line); font-size: 14px; }
.sp-facts dt { color: var(--sp-muted); font-weight: 600; }
.sp-facts dd { margin: 0; color: var(--sp-ink); font-weight: 700; }
.sp-points { padding-left: 20px; margin: 24px 0 32px; color: var(--sp-ink); }
.sp-points li { margin: 10px 0; line-height: 1.6; }

/* Gallery */
.sp-gallery { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 28px; }
.sp-gallery figure { background: var(--sp-surface); border: 1px solid var(--sp-line); border-radius: 12px; padding: 24px; text-align: center; box-shadow: 0 8px 24px rgba(15,23,42,0.03); }
.sp-gallery img { aspect-ratio: 1/1; object-fit: contain; max-height: 320px; margin: auto; }

/* Closing CTA Bar */
.sp-closing { padding: 88px 6%; text-align: center; background: var(--sp-surface); border-top: 1px solid var(--sp-line); border-bottom: 1px solid var(--sp-line); }
.sp-closing p { margin: 16px auto 32px; max-width: 560px; font-size: 18px; }
.sp-footer { display: flex; align-items: center; justify-content: space-between; gap: 30px; padding: 40px 5%; border-top: 1px solid var(--sp-line); background: var(--sp-surface-subtle); font-size: 13px; color: var(--sp-muted); }
.sp-footer > div { display: flex; gap: 16px; }

/* Form */
.sp-contact { display: grid; grid-template-columns: 1fr 1.2fr; gap: 60px; }
.sp-form { background: var(--sp-surface); border: 1px solid var(--sp-line); border-radius: 16px; padding: 40px; box-shadow: 0 12px 36px rgba(15,23,42,0.04); }
.sp-form .field { margin-bottom: 20px; }
.sp-form label { display: block; font-size: 13px; font-weight: 700; color: var(--sp-ink); margin-bottom: 6px; }
.sp-form input, .sp-form select, .sp-form textarea { width: 100%; padding: 12px 16px; border: 1px solid var(--sp-line); border-radius: 8px; background: #ffffff; color: var(--sp-ink); }
.sp-form .button { background: var(--sp-accent); color: #ffffff; border: none; padding: 14px 28px; border-radius: 6px; font-weight: 700; cursor: pointer; }

/* ── 1. HARDWARE KEYNOTE THEME (Video Background Banner) ── */
.sp-hardware {
  --sp-bg: #f8fafc;
  --sp-surface: #ffffff;
  --sp-surface-subtle: #f1f5f9;
  --sp-ink: #0f172a;
  --sp-muted: #64748b;
  --sp-line: #e2e8f0;
  --sp-accent: #0284c7;
  --sp-accent-ink: #ffffff;
}
.sp-video-hero {
  position: relative;
  overflow: hidden;
  min-height: 88vh;
  padding: 80px 6% 100px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 40px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}
.sp-video-scene, .sp-video-overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  overflow: hidden;
  pointer-events: none;
}
.sp-video-scene img, .sp-video-scene video {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.22;
  filter: saturate(1.2) contrast(1.05);
}
.sp-video-overlay {
  z-index: 2;
  background: linear-gradient(90deg, rgba(248, 250, 252, 0.94) 0%, rgba(248, 250, 252, 0.7) 50%, rgba(248, 250, 252, 0.92) 100%), linear-gradient(0deg, #f8fafc 0%, transparent 40%);
  backdrop-filter: blur(8px);
}
.sp-video-copy {
  position: relative;
  z-index: 3;
  max-width: 680px;
}
.sp-video-copy .sp-kicker { color: #0284c7; }
.sp-video-copy h1 { color: #0f172a; }
.sp-video-copy .sp-lead { color: #475569; }
.sp-site .sp-hero-product {
  position: relative;
  z-index: 3;
  width: 38%;
  max-width: 440px;
  padding: 36px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 24px;
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.08), 0 0 30px rgba(2, 132, 199, 0.05);
  text-align: center;
}
.sp-site .sp-hero-product img { aspect-ratio: 1/1; object-fit: contain; filter: drop-shadow(0 12px 24px rgba(15,23,42,0.1)); }
.sp-hero-bottom {
  position: absolute;
  bottom: 24px;
  left: 6%;
  right: 6%;
  z-index: 4;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  font-size: 11px;
  font-family: monospace;
  letter-spacing: 0.14em;
  color: #64748b;
  text-transform: uppercase;
}
.sp-hero-bottom button {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  color: #0f172a;
  border-radius: 20px;
  padding: 6px 16px;
  cursor: pointer;
  font-size: 11px;
  font-weight: 700;
  box-shadow: 0 2px 6px rgba(0,0,0,0.04);
}

/* Hardware Bento Grid */
.sp-hardware-bento {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 24px;
  margin-top: 32px;
}
.sp-bento-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 8px 24px rgba(15,23,42,0.03);
}
.sp-bento-grid3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 24px;
}

/* Unboxing Grid */
.sp-unboxing-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-top: 32px;
}
.sp-unboxing-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  box-shadow: 0 6px 18px rgba(15,23,42,0.03);
}

/* ── 2. ARTISAN CRAFT THEME (Pure Image Banner) ── */
.sp-artisan {
  --sp-bg: #fdfbf7;
  --sp-surface: #ffffff;
  --sp-surface-subtle: #f7f2ea;
  --sp-ink: #1e1915;
  --sp-muted: #786b61;
  --sp-line: #e8e2d8;
  --sp-accent: #b8924b;
  --sp-accent-ink: #ffffff;
}
.sp-artisan h1, .sp-artisan h2, .sp-artisan h3, .sp-artisan h4, .sp-artisan .sp-brand {
  font-family: Georgia, "Times New Roman", serif;
  font-weight: 400;
}
.sp-artisan .sp-button {
  background: #2a221b;
  border-color: #2a221b;
  color: #fdfbf7 !important;
  border-radius: 2px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  font-size: 13px;
  box-shadow: 0 4px 16px rgba(42,34,27,0.18);
}
.sp-pure-image {
  width: 100%;
  height: 72vh;
  max-height: 700px;
  min-height: 420px;
  overflow: hidden;
  background: #f7f2ea;
  border-bottom: 1px solid #e8e2d8;
  position: relative;
}
.sp-site .sp-pure-image > img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}
.sp-artisan-intro {
  padding: 80px 7% 90px;
  display: grid;
  grid-template-columns: 1fr 3fr 0.6fr;
  gap: 60px;
  border-bottom: 1px solid var(--sp-line);
  background: #fdfbf7;
  align-items: start;
}
.sp-artisan-intro h1 { font-size: clamp(38px, 4.4vw, 64px); }
.sp-artisan-intro .sp-kicker { padding-top: 10px; }
.sp-edition { font-family: Georgia, serif; font-size: 88px; color: #d4c8b5; text-align: right; line-height: 1; }

/* 5 Stages Timeline */
.sp-artisan-stages {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
  margin-top: 36px;
}
.sp-stage-card {
  background: #ffffff;
  border: 1px solid #e8e2d8;
  border-radius: 4px;
  padding: 24px 20px;
  box-shadow: 0 6px 18px rgba(44,36,32,0.03);
}
.sp-stage-num {
  font-family: Georgia, serif;
  font-size: 1.2rem;
  font-weight: 700;
  color: #b8924b;
  margin-bottom: 8px;
}

/* Provenance Ledger Table */
.sp-ledger-table {
  width: 100%;
  border-collapse: collapse;
  font-family: Georgia, serif;
  font-size: 15px;
  background: #ffffff;
  border: 1px solid #d4af37;
  border-radius: 4px;
  box-shadow: 0 10px 30px rgba(44,36,32,0.04);
}
.sp-ledger-table td {
  padding: 16px 20px;
  border-bottom: 1px solid #e8e2d8;
}

/* ── 3. NORDIC WELLNESS THEME (Image + Text Split Banner) ── */
.sp-nordic {
  --sp-bg: #f8faf7;
  --sp-surface: #ffffff;
  --sp-surface-subtle: #edf3eb;
  --sp-ink: #1e2d21;
  --sp-muted: #58735f;
  --sp-line: #dce4d7;
  --sp-accent: #3a5342;
  --sp-accent-ink: #ffffff;
}
.sp-nordic h1, .sp-nordic h2, .sp-nordic h3, .sp-nordic h4 {
  font-family: Georgia, "Times New Roman", serif;
  letter-spacing: -0.04em;
}
.sp-nordic .sp-button {
  border-radius: 999px;
  background: #3a5342;
  border-color: #3a5342;
  color: #ffffff !important;
  box-shadow: 0 4px 16px rgba(58,83,66,0.2);
}
.sp-nordic-hero {
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  gap: 60px;
  padding: 80px 6% 90px;
  align-items: center;
  min-height: 80vh;
  border-bottom: 1px solid #dce4d7;
  background: #f8faf7;
}
.sp-nordic-copy { padding: 20px 0; }
.sp-nordic-copy h1 { font-size: clamp(40px, 5.2vw, 72px); }
.sp-site .sp-nordic-hero img {
  height: 540px !important;
  object-fit: cover !important;
  border-radius: 160px 160px 16px 16px;
  box-shadow: 0 20px 50px rgba(58,83,66,0.1);
  border: 1px solid #dce4d7;
}
.sp-nordic-hero figcaption { text-align: center; }
.sp-small-note { font-size: 12px; color: var(--sp-muted); margin-top: 28px; }

/* Circadian Spectrum Bar */
.sp-circadian-bar {
  background: #ffffff;
  border: 1px solid #dce4d7;
  border-radius: 14px;
  padding: 16px 20px;
  margin: 24px 0 28px;
  box-shadow: 0 4px 14px rgba(58,83,66,0.04);
}
.sp-circadian-scale {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: #4a6755;
  margin-bottom: 8px;
}
.sp-circadian-track {
  height: 6px;
  border-radius: 999px;
  background: linear-gradient(to right, #fde68a, #93c5fd, #fde68a, #f97316);
  position: relative;
}
.sp-circadian-thumb {
  position: absolute;
  top: -4px;
  left: 50%;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #ffffff;
  border: 3px solid #3a5342;
  box-shadow: 0 2px 4px rgba(0,0,0,0.12);
}

/* Circadian Schedule Grid */
.sp-rhythm-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-top: 32px;
}
.sp-rhythm-card {
  background: #ffffff;
  border: 1px solid #dce4d7;
  border-radius: 20px;
  padding: 28px;
  box-shadow: 0 6px 18px rgba(58,83,66,0.03);
}

/* Clinical Evidence Grid */
.sp-clinical-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-top: 32px;
}
.sp-clinical-card {
  background: #ffffff;
  border: 1px solid #dce4d7;
  border-radius: 20px;
  padding: 32px;
  text-align: center;
  box-shadow: 0 6px 18px rgba(58,83,66,0.03);
}

/* Responsive Rules */
@media (max-width: 992px) {
  .sp-hardware-bento, .sp-split, .sp-nordic-hero, .sp-contact { grid-template-columns: 1fr; gap: 40px; }
  .sp-artisan-stages { grid-template-columns: repeat(2, 1fr); }
  .sp-rhythm-grid, .sp-unboxing-grid { grid-template-columns: repeat(2, 1fr); }
  .sp-clinical-grid, .sp-bento-grid3 { grid-template-columns: 1fr; }
  .sp-artisan-intro { grid-template-columns: 1fr; gap: 24px; }
  .sp-edition { display: none; }
  .sp-site .sp-hero-product { width: 100%; max-width: 320px; margin: 20px auto 0; }
  .sp-video-hero { flex-direction: column; align-items: flex-start; padding: 60px 6% 100px; min-height: 0; }
}

@media (max-width: 768px) {
  .sp-header { padding: 16px 5%; gap: 16px; flex-wrap: wrap; }
  .sp-brand { max-width: 70%; font-size: 18px; }
  .sp-languages { margin-left: auto; }
  .sp-header nav { order: 3; width: 100%; justify-content: space-between; gap: 8px; flex-wrap: wrap; font-size: 12px; }
  .sp-section { padding: 60px 5%; }
  .sp-gallery { grid-template-columns: 1fr; }
  .sp-artisan-stages, .sp-rhythm-grid, .sp-unboxing-grid { grid-template-columns: 1fr; }
  .sp-site .sp-nordic-hero img { height: 380px !important; border-radius: 100px 100px 12px 12px; }
}
`;
