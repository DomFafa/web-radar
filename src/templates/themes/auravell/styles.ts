// Auravell theme styling system: typography, layout stabilization and brand colors
export const auravellFixes = `
/* 1. TEXT BACKGROUND COLOR SANITIZATION */
h1, h2, h3, h4, h5, h6,
.rt-heading, .rt-sub-title, .rt-section-eyebrow,
p, em, i, b, strong, label {
  background-color: transparent !important;
}

/* 2. LAYOUT MISALIGNMENT & VISIBILITY FIXES */
[data-w-id],
.rt-hero-content,
.rt-hero-card-v1,
.rt-section-top,
.rt-section-full,
.rt-team-card-text,
.rt-team-frame,
.rt-footer-wrap-v1,
.rt-card,
.rt-classes-grid,
.rt-plans-grid,
.rt-schedule-row {
  opacity: 1 !important;
  transform: none !important;
  visibility: visible !important;
}

img, video {
  max-width: 100%;
  height: auto;
  display: block;
}

.w-background-video > video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: -1;
  position: absolute;
  top: 0;
  left: 0;
}

/* 3. HERO SECTION BACKGROUND & LAYERS */
.rt-hero {
  position: relative !important;
  overflow: hidden !important;
}
.rt-hero-image-wrap {
  position: absolute !important;
  inset: 0 !important;
  width: 100% !important;
  height: 100% !important;
  z-index: 1 !important;
}
.rt-hero-image,
[hero-image] {
  visibility: visible !important;
  opacity: 1 !important;
  position: absolute !important;
  inset: 0 !important;
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
  object-position: center 20% !important;
  z-index: 1 !important;
}
.rt-hero-gradient-v1 {
  position: absolute !important;
  inset: 0 !important;
  background-image: linear-gradient(60deg, rgba(23, 24, 26, 0.9) 0%, rgba(23, 24, 26, 0.5) 45%, rgba(23, 24, 26, 0.1) 80%) !important;
  z-index: 2 !important;
  pointer-events: none !important;
}
.rt-hero-v1-content {
  position: relative !important;
  z-index: 5 !important;
}

/* 4. TYPOGRAPHY SYSTEM */
* { box-sizing: border-box; }
body {
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
  color: #2a2b2f !important;
  background-color: #fef9ef !important;
  margin: 0;
  padding: 0;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow-x: hidden;
}

h1, h2, h3, h4, h5, h6,
.rt-heading, .rt-sub-title {
  font-family: "Playfair Display", Georgia, serif !important;
  color: #2a2b2f;
  font-weight: 400;
  line-height: 1.15;
}

.rt-text-color-quaternary,
.rt-text-color-quaternary *,
.rt-hero .rt-hero-v1-left-content *,
.rt-footer h1, .rt-footer h2, .rt-footer h3, .rt-footer h4,
.rt-footer p, .rt-footer span, .rt-footer a {
  color: #ffffff !important;
}

.rt-italic-text, em {
  font-style: italic !important;
  font-family: "Lora", "Playfair Display", Georgia, serif !important;
}

.rt-italic-text,
h1 em, h2 em, h3 em, h4 em, h5 em, h6 em {
  color: #99582a;
  background-color: transparent !important;
}

.rt-hero .rt-italic-text,
.rt-footer .rt-italic-text,
.rt-text-color-quaternary .rt-italic-text {
  color: #ffffff !important;
}

.rt-footer, .rt-section-full.dark, .rt-dark-banner {
  background-color: #17181a !important;
}
.rt-footer a:hover {
  color: #d7d2c8 !important;
}

/* 5. NAVBAR STABILITY */
.rt-navbar {
  position: sticky !important;
  top: 16px !important;
  z-index: 1000 !important;
}

.rt-nav-wrapper {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 40px;
  border: 1px solid rgba(215, 210, 200, 0.6);
  padding: 8px 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
}

.rt-navbar-dropdown-list-v1.w--open {
  display: block !important;
  opacity: 1 !important;
  visibility: visible !important;
  position: absolute;
  top: 100%;
  left: 0;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  padding: 12px 16px;
  min-width: 200px;
  z-index: 1001;
}

.rt-button-primary-v1, .w-button, a.rt-button {
  transition: transform 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
}
.rt-button-primary-v1:hover, .w-button:hover, a.rt-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(153, 88, 42, 0.25);
}

/* Dynamic Class & Detail Components */
.auravell-class-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 32px;
  margin-top: 40px;
}
@media (max-width: 991px) {
  .auravell-class-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 24px;
  }
}
@media (max-width: 640px) {
  .auravell-class-grid {
    grid-template-columns: 1fr;
  }
}
.auravell-class-card {
  background: #ffffff;
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid rgba(215, 210, 200, 0.5);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}
.auravell-class-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 28px rgba(153, 88, 42, 0.12);
}
.auravell-class-card img {
  width: 100%;
  aspect-ratio: 4/3;
  object-fit: cover;
}
.auravell-class-card-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}
.auravell-class-card h3 {
  font-size: 22px;
  margin: 0 0 8px;
  font-family: "Playfair Display", Georgia, serif;
}
.auravell-class-card p {
  font-size: 15px;
  line-height: 1.6;
  color: #555;
  margin: 0 0 16px;
  flex-grow: 1;
}
.auravell-class-card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: #99582a;
  border-top: 1px solid #f0ebe1;
  padding-top: 12px;
}

/* Detail page styling */
.auravell-detail-section {
  max-width: 1240px;
  margin: 0 auto;
  padding: 80px 24px 120px;
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 56px;
}
@media (max-width: 860px) {
  .auravell-detail-section {
    grid-template-columns: 1fr;
    gap: 36px;
    padding-top: 40px;
  }
}
.auravell-detail-gallery {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.auravell-detail-main-img {
  width: 100%;
  border-radius: 20px;
  aspect-ratio: 4/3;
  object-fit: cover;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
}
.auravell-detail-thumbs {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 8px;
}
.auravell-detail-thumb {
  width: 84px;
  height: 64px;
  border-radius: 10px;
  overflow: hidden;
  border: 2px solid transparent;
  cursor: pointer;
  flex-shrink: 0;
}
.auravell-detail-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.auravell-detail-thumb.active {
  border-color: #99582a;
}
.auravell-detail-content h1 {
  font-size: 42px;
  margin: 0 0 16px;
  font-family: "Playfair Display", Georgia, serif;
}
.auravell-detail-content .lead {
  font-size: 18px;
  line-height: 1.7;
  color: #444;
  margin-bottom: 24px;
}
.auravell-detail-features {
  list-style: none;
  padding: 0;
  margin: 0 0 32px;
}
.auravell-detail-features li {
  padding: 8px 0 8px 28px;
  position: relative;
  font-size: 15px;
  color: #333;
}
.auravell-detail-features li::before {
  content: "✦";
  position: absolute;
  left: 0;
  color: #99582a;
}

/* Inquiry form in Auravell style */
.auravell-inquiry-box {
  background: #fdfaf4;
  border: 1px solid #ebdccb;
  border-radius: 20px;
  padding: 32px;
  margin-top: 32px;
}
.auravell-inquiry-box input,
.auravell-inquiry-box textarea,
.auravell-inquiry-box select {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d9cdbd;
  border-radius: 10px;
  background: #ffffff;
  font-size: 15px;
  margin-bottom: 16px;
  font-family: "Inter", sans-serif;
  box-sizing: border-box;
}
.auravell-inquiry-box button[type="submit"] {
  background: #99582a;
  color: #ffffff;
  border: 0;
  border-radius: 30px;
  padding: 14px 32px;
  font-size: 16px;
  cursor: pointer;
  width: 100%;
  transition: opacity 0.2s;
}
.auravell-inquiry-box button[type="submit"]:hover {
  opacity: 0.9;
}

/* Inline reference grids need explicit small-screen tracks. */
.auravell [style*="display:grid"] > *, .auravell-detail-section > * { min-width: 0; }
.auravell h1, .auravell h2, .auravell h3, .auravell p { overflow-wrap: break-word; }
.auravell .rt-footer a[style*="background:#ffffff"] { color: #17181a !important; }
.auravell [data-auravell-tab] { flex-shrink: 0; }
@media(max-width: 767px) {
 .auravell [style*="display:grid"] { grid-template-columns: minmax(0,1fr) !important; gap: 24px !important; }
 .auravell .rt-container { width: 100%; padding-left: 20px; padding-right: 20px; }
 .auravell .rt-hero-content { flex-direction: column; align-items: stretch; gap: 28px; }
 .auravell .rt-hero-card-v1 { width: 100% !important; max-width: 340px; }
 .auravell h1 { font-size: clamp(30px, 8vw, 42px) !important; }
 .auravell h2 { font-size: 30px !important; }
 .auravell-inquiry-box { padding: 20px; }
 .auravell [style*="display:inline-flex"] { display: flex !important; flex-wrap: wrap; justify-content: center; }
 .auravell .rt-footer [style*="display:flex"] { flex-wrap: wrap; gap: 24px; }
}
`;
