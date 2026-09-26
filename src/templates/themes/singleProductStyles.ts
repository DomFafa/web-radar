export const singleProductStyles = `
/* ==========================================================================
   Single Product Showcase Templates — 100% Light Themed, Radically Differentiated
   ========================================================================== */

/* Base Design Tokens */
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
.sp-site h1 { font-size: clamp(36px, 5.2vw, 72px); }
.sp-site h2 { font-size: clamp(26px, 3.6vw, 44px); }
.sp-site h3 { font-size: clamp(20px, 2.4vw, 30px); }
.sp-site h4 { font-size: 17px; }
.sp-site figure { margin: 0; }
.sp-site img { display: block; width: 100%; object-fit: cover; }
.sp-site button, .sp-site input, .sp-site select, .sp-site textarea { font: inherit; }
.sp-site :focus-visible { outline: 3px solid var(--sp-accent); outline-offset: 4px; }
.sp-kicker {
  display: inline-block;
  font-size: 11px;
  letter-spacing: 0.16em;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--sp-accent);
  margin-bottom: 14px;
}
.sp-lead { font-size: 18px; line-height: 1.6; max-width: 640px; color: var(--sp-muted); margin: 18px 0 28px; }

/* Global Buttons & Links */
.sp-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  border: 1px solid var(--sp-accent);
  padding: 13px 26px;
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
.sp-actions { display: flex; align-items: center; gap: 18px; flex-wrap: wrap; margin-top: 16px; }
.sp-text-link { font-size: 14px; font-weight: 700; color: var(--sp-accent); border-bottom: 1px solid currentColor; padding-bottom: 2px; }
.sp-no-photo { display: grid; place-items: center; min-height: 320px; background: var(--sp-surface-subtle); border: 1px dashed var(--sp-line); border-radius: 12px; color: var(--sp-muted); font-weight: 600; }
.sp-section { padding: 84px 6%; max-width: 1400px; margin: auto; }
.sp-section-heading { margin-bottom: 44px; }
.sp-section-heading h2 { margin-top: 8px; }

/* Facts Table */
.sp-facts { margin: 24px 0 32px; border-top: 1px solid var(--sp-line); }
.sp-facts > div { display: grid; grid-template-columns: 140px 1fr; gap: 16px; padding: 14px 0; border-bottom: 1px solid var(--sp-line); font-size: 14px; }
.sp-facts dt { color: var(--sp-muted); font-weight: 600; }
.sp-facts dd { margin: 0; color: var(--sp-ink); font-weight: 700; }
.sp-points { padding-left: 20px; margin: 24px 0 32px; color: var(--sp-ink); }
.sp-points li { margin: 10px 0; line-height: 1.6; }

/* Form Component */
.sp-form { background: var(--sp-surface); border: 1px solid var(--sp-line); border-radius: 16px; padding: 36px; box-shadow: 0 12px 36px rgba(15,23,42,0.04); }
.sp-form .field { margin-bottom: 20px; }
.sp-form label { display: block; font-size: 13px; font-weight: 700; color: var(--sp-ink); margin-bottom: 6px; }
.sp-form input, .sp-form select, .sp-form textarea { width: 100%; padding: 12px 16px; border: 1px solid var(--sp-line); border-radius: 8px; background: #ffffff; color: var(--sp-ink); }
.sp-form .button { background: var(--sp-accent); color: #ffffff; border: none; padding: 14px 28px; border-radius: 6px; font-weight: 700; cursor: pointer; }

/* Hubs, Métiers & Timeline (About & Contact Shared Patterns) */
.sp-hub-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin: 32px 0; }
.sp-hub-card { background: var(--sp-surface); border: 1px solid var(--sp-line); border-radius: 16px; padding: 28px; box-shadow: 0 8px 24px rgba(15, 23, 42, 0.03); display: flex; flex-direction: column; justify-content: space-between; }
.sp-hub-badge { display: inline-flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: var(--sp-accent); margin-bottom: 12px; }
.sp-hub-badge::before { content: ""; display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: currentColor; }
.sp-metiers-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-top: 32px; }
.sp-metier-card { background: var(--sp-surface); border: 1px solid var(--sp-line); border-radius: 14px; padding: 24px; box-shadow: 0 6px 18px rgba(15, 23, 42, 0.03); }
.sp-timeline-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 32px; }
.sp-timeline-card { background: var(--sp-surface); border: 1px solid var(--sp-line); border-radius: 16px; padding: 28px; position: relative; box-shadow: 0 6px 18px rgba(15, 23, 42, 0.03); }
.sp-timeline-year { font-size: 12px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; color: var(--sp-accent); margin-bottom: 8px; }
.sp-contact-custom { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 60px; align-items: start; }
.sp-contact-hubs { display: flex; flex-direction: column; gap: 20px; margin-top: 28px; }

/* ==========================================================================
   1. HARDWARE KEYNOTE THEME (Precision Monospace, Telemetry HUD, Video Hero)
   ========================================================================== */
.sp-hardware {
  --sp-bg: #f8fafc;
  --sp-surface: #ffffff;
  --sp-surface-subtle: #f1f5f9;
  --sp-ink: #0f172a;
  --sp-muted: #475569;
  --sp-line: #cbd5e1;
  --sp-accent: #0284c7;
  --sp-accent-ink: #ffffff;
}

/* Hardware Telemetry Bar */
.sp-hw-telemetry-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 6%;
  background: #f1f5f9;
  border-bottom: 1px solid #e2e8f0;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 11px;
  letter-spacing: 0.12em;
  color: #64748b;
  text-transform: uppercase;
}
.sp-hw-dot { color: #10b981; animation: spPulse 2s infinite; }
@keyframes spPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

/* Hardware Header */
.sp-hw-header {
  min-height: 72px;
  padding: 14px 6%;
  display: flex;
  align-items: center;
  gap: 32px;
  border-bottom: 1px solid var(--sp-line);
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(12px);
  position: sticky;
  top: 0;
  z-index: 80;
}
.sp-hw-header .sp-brand { font-family: ui-monospace, monospace; font-size: 17px; font-weight: 800; color: #0f172a; letter-spacing: -0.01em; }
.sp-brand-bracket { color: #0284c7; margin-right: 4px; }
.sp-hw-header nav { display: flex; gap: 28px; margin: auto; font-family: ui-monospace, monospace; font-size: 12px; font-weight: 700; letter-spacing: 0.06em; }
.sp-hw-header nav a { color: #64748b; transition: color 0.15s ease; }
.sp-hw-header nav a:hover, .sp-hw-header nav a[aria-current=page] { color: #0284c7; border-bottom: 2px solid #0284c7; padding-bottom: 4px; }
.sp-hw-header .sp-languages { display: flex; gap: 8px; font-family: ui-monospace, monospace; font-size: 11px; font-weight: 700; }

/* Video Background Banner */
.sp-video-hero {
  position: relative;
  overflow: hidden;
  min-height: 86vh;
  padding: 72px 6% 96px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 40px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}
.sp-video-scene, .sp-video-overlay { position: absolute; inset: 0; z-index: 1; overflow: hidden; pointer-events: none; }
.sp-video-scene img, .sp-video-scene video { position: absolute; width: 100%; height: 100%; object-fit: cover; opacity: 0.22; filter: saturate(1.2) contrast(1.05); }
.sp-video-overlay { z-index: 2; background: linear-gradient(90deg, rgba(248, 250, 252, 0.95) 0%, rgba(248, 250, 252, 0.72) 50%, rgba(248, 250, 252, 0.94) 100%), linear-gradient(0deg, #f8fafc 0%, transparent 40%); backdrop-filter: blur(8px); }
.sp-video-copy { position: relative; z-index: 3; max-width: 680px; }
.sp-video-copy .sp-kicker { font-family: ui-monospace, monospace; color: #0284c7; }
.sp-site .sp-hero-product {
  position: relative;
  z-index: 3;
  width: 40%;
  max-width: 460px;
  padding: 36px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.08), 0 0 30px rgba(2, 132, 199, 0.06);
  text-align: center;
}
.sp-site .sp-hero-product img { aspect-ratio: 1/1; object-fit: contain; filter: drop-shadow(0 14px 28px rgba(15,23,42,0.12)); }
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
  font-family: ui-monospace, monospace;
  letter-spacing: 0.14em;
  color: #64748b;
  text-transform: uppercase;
}
.sp-hero-bottom button {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  color: #0f172a;
  border-radius: 4px;
  padding: 6px 14px;
  cursor: pointer;
  font-size: 11px;
  font-weight: 700;
  font-family: ui-monospace, monospace;
  box-shadow: 0 2px 6px rgba(0,0,0,0.04);
}

/* Hardware Telemetry HUD Matrix */
.sp-hw-hud-matrix {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin: 32px 0 48px;
}
.sp-hw-hud-card {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 22px 20px;
  box-shadow: 0 4px 14px rgba(15,23,42,0.04);
}
.sp-hw-hud-val {
  font-family: ui-monospace, monospace;
  font-size: 2.2rem;
  font-weight: 800;
  color: #0284c7;
  line-height: 1.1;
  margin-bottom: 6px;
}
.sp-hw-hud-lbl {
  font-family: ui-monospace, monospace;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #64748b;
}

/* Hardware Bento & Unboxing */
.sp-hardware-bento { display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 24px; margin-top: 32px; }
.sp-bento-card { background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 32px; box-shadow: 0 8px 24px rgba(15,23,42,0.03); }
.sp-bento-grid3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 24px; }
.sp-unboxing-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-top: 32px; }
.sp-unboxing-card { background: #ffffff; border: 1px solid #cbd5e1; border-radius: 10px; padding: 24px; text-align: center; box-shadow: 0 6px 18px rgba(15,23,42,0.03); }

/* Hardware Detail Workbench */
.sp-hw-workbench {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  box-shadow: 0 12px 40px rgba(15,23,42,0.05);
  overflow: hidden;
  margin: 32px auto 60px;
}
.sp-hw-workbench-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  background: #f1f5f9;
  border-bottom: 1px solid #cbd5e1;
  font-family: ui-monospace, monospace;
  font-size: 11px;
  letter-spacing: 0.1em;
  color: #475569;
  text-transform: uppercase;
}
.sp-hw-workbench-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  padding: 40px;
  gap: 60px;
}
.sp-hw-viewport {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 36px;
  text-align: center;
  position: relative;
}
.sp-hw-viewport img { max-height: 420px; aspect-ratio: 1/1; object-fit: contain; margin: auto; filter: drop-shadow(0 16px 32px rgba(15,23,42,0.1)); }
.sp-hw-cad-badge {
  display: inline-block;
  font-family: ui-monospace, monospace;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.14em;
  color: #0284c7;
  background: #e0f2fe;
  padding: 4px 10px;
  border-radius: 4px;
  margin-top: 14px;
}
.sp-hw-gallery { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; margin-top: 32px; }
.sp-hw-gallery figure { background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; padding: 24px; text-align: center; }
.sp-hw-gallery img { max-height: 300px; aspect-ratio: 1/1; object-fit: contain; margin: auto; }
.sp-hw-closing { background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 64px 6%; text-align: center; margin: 48px auto; box-shadow: 0 10px 30px rgba(15,23,42,0.04); }

/* Hardware Footer */
.sp-hw-footer { background: #f1f5f9; border-top: 1px solid #cbd5e1; padding: 36px 6%; font-family: ui-monospace, monospace; font-size: 12px; color: #64748b; }
.sp-hw-footer-main { display: flex; align-items: center; justify-content: space-between; gap: 24px; margin-bottom: 20px; }
.sp-hw-footer-sub { display: flex; align-items: center; justify-content: space-between; border-top: 1px solid #e2e8f0; padding-top: 16px; font-size: 11px; }

/* ==========================================================================
   2. ARTISAN CRAFT THEME (Editorial Monograph, Swiss Atelier, Pure Image Hero)
   ========================================================================== */
.sp-artisan {
  --sp-bg: #fdfbf7;
  --sp-surface: #ffffff;
  --sp-surface-subtle: #f7f2ea;
  --sp-ink: #1e1915;
  --sp-muted: #6b5c50;
  --sp-line: #e8e2d8;
  --sp-accent: #b8924b;
  --sp-accent-ink: #ffffff;
}
.sp-artisan h1, .sp-artisan h2, .sp-artisan h3, .sp-artisan h4, .sp-artisan .sp-brand {
  font-family: "Playfair Display", Georgia, "Times New Roman", serif;
  font-weight: 400;
  letter-spacing: -0.01em;
}
.sp-artisan .sp-button {
  background: #2a221b;
  border-color: #2a221b;
  color: #fdfbf7 !important;
  border-radius: 0px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-size: 12px;
  padding: 15px 32px;
  box-shadow: 0 4px 16px rgba(42,34,27,0.18);
}
.sp-artisan .sp-button:hover { background: #1a1511; transform: translateY(-1px); }

/* Artisan Centered Maison Header */
.sp-artisan-header {
  background: #fdfbf7;
  border-bottom: 1px solid #e8e2d8;
  padding: 0;
  position: sticky;
  top: 0;
  z-index: 80;
}
.sp-artisan-tagline {
  text-align: center;
  padding: 8px 5%;
  font-family: Georgia, serif;
  font-size: 10px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #948577;
  border-bottom: 1px solid #f2ede4;
}
.sp-artisan-brand-row {
  text-align: center;
  padding: 22px 5% 14px;
}
.sp-artisan-brand-row .sp-brand {
  font-size: 26px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #1e1915;
}
.sp-artisan-nav-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 6%;
  border-top: 1px solid #e8e2d8;
  font-size: 12px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
.sp-artisan-nav-row nav { display: flex; gap: 36px; margin: auto; }
.sp-artisan-nav-row nav a { color: #786b61; transition: color 0.2s ease; }
.sp-artisan-nav-row nav a:hover, .sp-artisan-nav-row nav a[aria-current=page] { color: #b8924b; border-bottom: 1px solid #b8924b; padding-bottom: 2px; }
.sp-artisan-nav-row .sp-languages { display: flex; gap: 12px; font-size: 11px; }

/* Pure Image Hero */
.sp-pure-image {
  width: 100%;
  height: 72vh;
  max-height: 720px;
  min-height: 440px;
  overflow: hidden;
  background: #f7f2ea;
  border-bottom: 1px solid #e8e2d8;
  position: relative;
}
.sp-site .sp-pure-image > img { width: 100%; height: 100%; object-fit: cover; object-position: center; }
.sp-artisan-intro {
  padding: 88px 7% 96px;
  display: grid;
  grid-template-columns: 1fr 3fr 0.6fr;
  gap: 60px;
  border-bottom: 1px solid var(--sp-line);
  background: #fdfbf7;
  align-items: start;
}
.sp-artisan-intro h1 { font-size: clamp(38px, 4.4vw, 64px); line-height: 1.15; }
.sp-edition { font-family: "Playfair Display", Georgia, serif; font-size: 96px; color: #dfd4c4; text-align: right; line-height: 1; }

/* Atelier Diptych (Editorial Book Spread) */
.sp-artisan-diptych {
  display: grid;
  grid-template-columns: 1fr 1.1fr;
  gap: 64px;
  align-items: center;
  padding: 96px 7%;
  border-bottom: 1px solid #e8e2d8;
  background: #fcfaf6;
}
.sp-artisan-plate {
  border: 1px solid #e8e2d8;
  padding: 24px;
  background: #ffffff;
  box-shadow: 0 16px 40px rgba(30,25,21,0.04);
}
.sp-artisan-plate img { aspect-ratio: 4/5; object-fit: cover; max-height: 540px; }
.sp-artisan-plate figcaption { text-align: center; font-family: Georgia, serif; font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: #948577; margin-top: 16px; }
.sp-artisan-manifesto { padding-left: 20px; }
.sp-artisan-manifesto h3 { font-size: clamp(24px, 2.8vw, 36px); margin: 12px 0 20px; font-style: italic; }

/* 5 Métiers d'Art Stages */
.sp-artisan-stages { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; margin-top: 36px; }
.sp-stage-card { background: #ffffff; border: 1px solid #e8e2d8; border-radius: 0px; padding: 26px 20px; box-shadow: 0 4px 14px rgba(44,36,32,0.02); }
.sp-stage-num { font-family: "Playfair Display", Georgia, serif; font-size: 1.15rem; font-weight: 700; color: #b8924b; margin-bottom: 8px; }

/* Provenance Ledger Table */
.sp-ledger-table { width: 100%; border-collapse: collapse; font-family: Georgia, serif; font-size: 15px; background: #ffffff; border: 1px solid #d4af37; box-shadow: 0 10px 30px rgba(44,36,32,0.04); }
.sp-ledger-table td { padding: 18px 22px; border-bottom: 1px solid #e8e2d8; }

/* Curatorial Gallery */
.sp-artisan-gallery { display: grid; grid-template-columns: repeat(2, 1fr); gap: 36px; margin-top: 36px; }
.sp-artisan-gallery figure { background: #ffffff; border: 1px solid #e8e2d8; padding: 28px; text-align: center; }
.sp-artisan-gallery img { max-height: 380px; aspect-ratio: 1/1; object-fit: contain; margin: auto; }
.sp-artisan-gallery figcaption { font-family: Georgia, serif; font-size: 12px; font-style: italic; color: #786b61; margin-top: 14px; }

/* Engraved Salon Invitation */
.sp-artisan-invitation {
  border: 1px solid #d4af37;
  background: #fdfbf7;
  padding: 72px 8%;
  text-align: center;
  margin: 64px auto;
  position: relative;
  box-shadow: 0 12px 36px rgba(42,34,27,0.05);
}
.sp-artisan-invitation::before { content: ""; position: absolute; inset: 6px; border: 1px solid #e8e2d8; pointer-events: none; }
.sp-artisan-invitation h2 { font-style: italic; }

/* Artisan Footer */
.sp-artisan-footer { background: #f7f2ea; border-top: 1px solid #e8e2d8; padding: 56px 6% 40px; text-align: center; }
.sp-artisan-footer-crest { font-size: 28px; margin-bottom: 12px; }
.sp-artisan-footer .sp-brand { font-size: 22px; letter-spacing: 0.16em; text-transform: uppercase; }
.sp-artisan-footer-motto { font-family: Georgia, serif; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #948577; margin: 12px 0 24px; }

/* ==========================================================================
   3. NORDIC WELLNESS THEME (Biophilic Curves, Circadian Bar, Floating Pill Nav)
   ========================================================================== */
.sp-nordic {
  --sp-bg: #f8faf7;
  --sp-surface: #ffffff;
  --sp-surface-subtle: #edf3eb;
  --sp-ink: #1e2d21;
  --sp-muted: #4e6b56;
  --sp-line: #dce4d7;
  --sp-accent: #3a5342;
  --sp-accent-ink: #ffffff;
}
.sp-nordic h1, .sp-nordic h2, .sp-nordic h3, .sp-nordic h4 {
  font-family: Georgia, "Times New Roman", serif;
  letter-spacing: -0.03em;
}
.sp-nordic .sp-button {
  border-radius: 999px;
  background: #3a5342;
  border-color: #3a5342;
  color: #ffffff !important;
  padding: 14px 30px;
  box-shadow: 0 6px 20px rgba(58,83,66,0.18);
}
.sp-nordic .sp-button:hover { background: #2b3e31; transform: translateY(-1px); }

/* Floating Capsule Pill Header */
.sp-nordic-header {
  padding: 16px 5%;
  background: transparent;
  position: sticky;
  top: 0;
  z-index: 80;
}
.sp-nordic-pill-bar {
  max-width: 1160px;
  margin: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 28px;
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(20px);
  border: 1px solid #dce4d7;
  border-radius: 999px;
  box-shadow: 0 8px 30px rgba(30, 45, 33, 0.05);
}
.sp-nordic-pill-bar .sp-brand { font-size: 18px; font-weight: 700; color: #1e2d21; display: flex; align-items: center; gap: 8px; }
.sp-nordic-symbol { color: #3a5342; }
.sp-nordic-pill-bar nav { display: flex; gap: 24px; margin: auto; font-size: 13px; font-weight: 600; }
.sp-nordic-pill-bar nav a { color: #58735f; padding: 6px 14px; border-radius: 999px; transition: all 0.2s ease; }
.sp-nordic-pill-bar nav a:hover, .sp-nordic-pill-bar nav a[aria-current=page] { background: #edf3eb; color: #1e2d21; }
.sp-nordic-pill-bar .sp-languages { display: flex; gap: 8px; font-size: 12px; }

/* Image + Text Split Banner with Arched Photo */
.sp-nordic-hero {
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  gap: 60px;
  padding: 72px 6% 88px;
  align-items: center;
  min-height: 82vh;
  border-bottom: 1px solid #dce4d7;
  background: #f8faf7;
}
.sp-nordic-copy { padding: 20px 0; }
.sp-nordic-copy h1 { font-size: clamp(38px, 5vw, 68px); line-height: 1.18; }
.sp-site .sp-nordic-hero img {
  height: 520px !important;
  object-fit: cover !important;
  border-radius: 180px 180px 24px 24px;
  box-shadow: 0 24px 60px rgba(58,83,66,0.12);
  border: 1px solid #dce4d7;
}

/* Circadian Spectrum Bar */
.sp-circadian-bar {
  background: #ffffff;
  border: 1px solid #dce4d7;
  border-radius: 16px;
  padding: 16px 20px;
  margin: 24px 0 28px;
  box-shadow: 0 4px 16px rgba(58,83,66,0.04);
}
.sp-circadian-scale { display: flex; justify-content: space-between; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #4a6755; margin-bottom: 8px; }
.sp-circadian-track { height: 6px; border-radius: 999px; background: linear-gradient(to right, #fde68a, #93c5fd, #fde68a, #f97316); position: relative; }
.sp-circadian-thumb { position: absolute; top: -4px; left: 50%; width: 14px; height: 14px; border-radius: 50%; background: #ffffff; border: 3px solid #3a5342; box-shadow: 0 2px 4px rgba(0,0,0,0.12); }

/* Circadian Schedule Grid */
.sp-rhythm-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-top: 32px; }
.sp-rhythm-card { background: #ffffff; border: 1px solid #dce4d7; border-radius: 24px; padding: 28px; box-shadow: 0 6px 20px rgba(58,83,66,0.03); }

/* Biophilic Living Space Pod */
.sp-nordic-pod {
  background: #ffffff;
  border: 1px solid #dce4d7;
  border-radius: 32px;
  padding: 48px;
  margin: 40px 0;
  box-shadow: 0 12px 36px rgba(58,83,66,0.04);
}
.sp-nordic-pod-split { display: grid; grid-template-columns: 1fr 1fr; gap: 56px; align-items: center; }
.sp-nordic-pod img { border-radius: 20px; max-height: 420px; aspect-ratio: 1/1; object-fit: cover; }
.sp-swatches { display: flex; gap: 16px; margin: 20px 0 28px; }
.sp-swatch { flex: 1; padding: 14px 16px; background: #f8faf7; border: 1px solid #dce4d7; border-radius: 12px; font-size: 12px; }
.sp-swatch strong { display: block; color: #1e2d21; margin-bottom: 2px; }

/* Clinical Evidence Grid */
.sp-clinical-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 32px; }
.sp-clinical-card { background: #ffffff; border: 1px solid #dce4d7; border-radius: 24px; padding: 32px; text-align: center; box-shadow: 0 6px 20px rgba(58,83,66,0.03); }

/* Nordic Gallery */
.sp-nordic-gallery { display: grid; grid-template-columns: repeat(2, 1fr); gap: 32px; margin-top: 36px; }
.sp-nordic-gallery figure { background: #ffffff; border: 1px solid #dce4d7; border-radius: 24px; padding: 28px; text-align: center; box-shadow: 0 6px 20px rgba(58,83,66,0.03); }
.sp-nordic-gallery img { max-height: 340px; aspect-ratio: 1/1; object-fit: contain; margin: auto; border-radius: 16px; }

/* Nordic Closing */
.sp-nordic-closing {
  background: #edf3eb;
  border: 1px solid #dce4d7;
  border-radius: 36px;
  padding: 72px 8%;
  text-align: center;
  margin: 56px auto;
  box-shadow: 0 10px 30px rgba(58,83,66,0.05);
}

/* Nordic Footer */
.sp-nordic-footer { background: #edf3eb; border-top: 1px solid #dce4d7; padding: 48px 6% 36px; }
.sp-nordic-footer-inner { display: flex; align-items: center; justify-content: space-between; gap: 24px; margin-bottom: 24px; }
.sp-nordic-footer-bottom { display: flex; align-items: center; justify-content: space-between; border-top: 1px solid #dce4d7; padding-top: 18px; font-size: 11px; color: #58735f; }

/* ==========================================================================
   Responsive Adaptations
   ========================================================================== */
@media (max-width: 992px) {
  .sp-hardware-bento, .sp-nordic-hero, .sp-contact-custom, .sp-hw-workbench-split, .sp-artisan-diptych, .sp-nordic-pod-split { grid-template-columns: 1fr; gap: 40px; }
  .sp-hw-hud-matrix, .sp-metiers-grid, .sp-timeline-grid, .sp-hub-grid { grid-template-columns: repeat(2, 1fr); }
  .sp-rhythm-grid, .sp-unboxing-grid, .sp-artisan-stages { grid-template-columns: repeat(2, 1fr); }
  .sp-clinical-grid, .sp-bento-grid3 { grid-template-columns: 1fr; }
  .sp-artisan-intro { grid-template-columns: 1fr; gap: 24px; }
  .sp-edition { display: none; }
  .sp-site .sp-hero-product { width: 100%; max-width: 360px; margin: 24px auto 0; }
  .sp-video-hero { flex-direction: column; align-items: flex-start; padding: 60px 6% 90px; min-height: 0; }
}

@media (max-width: 768px) {
  .sp-hw-header, .sp-artisan-nav-row, .sp-nordic-pill-bar { flex-direction: column; gap: 14px; }
  .sp-hw-header nav, .sp-artisan-nav-row nav, .sp-nordic-pill-bar nav { width: 100%; justify-content: space-between; gap: 8px; flex-wrap: wrap; font-size: 12px; }
  .sp-section { padding: 60px 5%; }
  .sp-hw-gallery, .sp-artisan-gallery, .sp-nordic-gallery { grid-template-columns: 1fr; }
  .sp-hw-hud-matrix, .sp-rhythm-grid, .sp-unboxing-grid, .sp-artisan-stages, .sp-swatches { grid-template-columns: 1fr; flex-direction: column; }
  .sp-site .sp-nordic-hero img { height: 380px !important; border-radius: 120px 120px 16px 16px; }
  .sp-hw-workbench-split { padding: 24px 16px; }
  .sp-nordic-pod { padding: 28px 16px; }
  .sp-hw-footer-main, .sp-hw-footer-sub, .sp-nordic-footer-inner, .sp-nordic-footer-bottom { flex-direction: column; align-items: flex-start; gap: 10px; }
}
`;
