/** Semantic layout rules shared by previews and published Mello pages. */
export const melloLayoutStyles = `
.mello-coffee { --mello-accent-ink: #17261c; --mello-accent-icon: none; }
.mello-coffee .pg-skip:not(:focus) { clip-path: inset(50%); }
.mello-coffee .menu-info { display: block; width: 100%; }
.mello-coffee .menu-categories { width: 100%; min-width: 0; }
.mello-coffee .menu-row { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 64px; }
.mello-coffee .menu-category { min-width: 0; }
.mello-coffee .text-and-volume-wrapper,
.mello-coffee .menu-item { display: grid; grid-template-columns: minmax(0,1fr) auto; gap: 20px; align-items: baseline; }
.mello-coffee .menu-item > p,
.mello-coffee .text-and-volume-wrapper > p { min-width: 0; margin: 0; overflow-wrap: anywhere; }
.mello-coffee .volumes-wrapper { flex-shrink: 0; gap: 20px; }
.mello-coffee .volume-text { flex: 0 0 52px; width: 52px; white-space: nowrap; font-variant-numeric: tabular-nums; }
/* Confirmed customer copy can replace prices with full phrases. */
.mello-coffee.wr-materials-site .menu-item,
.mello-coffee.wr-materials-site .text-and-volume-wrapper { grid-template-columns: minmax(0,1.4fr) repeat(2,minmax(0,1fr)); align-items: start; }
.mello-coffee.wr-materials-site .menu-info .volumes-wrapper { display: contents; }
.mello-coffee.wr-materials-site .menu-info .volume-text { min-width: 0; width: auto; white-space: normal; overflow-wrap: anywhere; }
.mello-coffee .menu-link { isolation: isolate; color: var(--black); border-radius: var(--_sizes---small-radius); }
.mello-coffee .menu-link:is(:hover,:focus-visible,[aria-current="page"]) { background: var(--accent); color: var(--mello-accent-ink); }
.mello-coffee .menu-link .link-background { background: transparent; }
.mello-coffee .menu-link:focus-visible { outline: 2px solid var(--black); outline-offset: 3px; }
.mello-coffee .info-bar,
.mello-coffee .info-bar .body-m { color: var(--mello-accent-ink); }
.mello-coffee .info-bar-icon { filter: var(--mello-accent-icon); }
.mello-coffee .hero { height: auto; min-height: 0; max-height: none; }
.mello-coffee .hero-text { width: 100%; max-width: 1000px; padding: 0; margin: 0 auto; gap: 28px; }
.mello-coffee .hero-text .hero-h1 { font-size: clamp(48px,6.5vw,104px); line-height: 1.04; max-width: 100%; margin: 0; text-wrap: balance; overflow-wrap: anywhere; }
.mello-coffee .hero-text .hero-p { max-width: 760px; margin: 0; }
.mello-coffee .hero-text .buttons-wrapper { flex-wrap: wrap; }
.mello-coffee .hero-text .button { background: var(--accent); color: var(--mello-accent-ink); }
.mello-coffee .hero-text .button.w-variant-c95095ce-7382-225f-41af-d39d3577dbad { background: transparent; color: var(--black); }
.mello-coffee div.hero-image { display: grid; grid-template-columns: minmax(0,1fr) minmax(0,1fr); align-items: end; gap: 24px; }
.mello-coffee .hero-image > .image { grid-column: 1 / -1; grid-row: 2; width: 100%; max-height: 760px; height: auto; object-fit: cover; }
.mello-coffee .hero-image > .product { position: static; max-width: 100%; min-width: 0; }
.mello-coffee .hero-image .details { flex-wrap: wrap; }
.mello-coffee .hero-image > .quality-badge { position: static; justify-self: end; min-width: 0; max-width: 100%; transform: none; }
.mello-coffee .hero-image .quality-badge-illu { flex-shrink: 0; }
.mello-coffee .hero-image > .hero-arrow { display: none; }
.mello-coffee main { overflow-x: clip; }
.mello-coffee .footer-menu,
.mello-coffee .footer-info,
.mello-coffee .footer-menu .display-s { min-width: 0; overflow-wrap: anywhere; }
.mello-coffee .wheel-block { min-width: 0; }
.mello-coffee .wheel-text { min-width: 0; text-align: center; overflow-wrap: anywhere; }
.mello-coffee.wr-materials-site .time { flex-wrap: wrap; min-width: 0; gap: 12px; }
.mello-coffee.wr-materials-site .time .display-l { font-size: clamp(40px,7vw,96px); max-width: 100%; overflow-wrap: anywhere; }
/* The reusable markup has no Webflow node IDs. Define complete grids here,
   instead of relying on the original export's ID-based column spans. */
.mello-coffee .section-heading:not(.default) { grid-template-columns: minmax(0,1.6fr) minmax(0,1fr); align-items: end; gap: 48px; }
.mello-coffee .section-heading > *,
.mello-coffee .wheel-product > *,
.mello-coffee .time-wrapper-info > *,
.mello-coffee .spot-content > *,
.mello-coffee .visit-info > *,
.mello-coffee .column > * { min-width: 0; }
.mello-coffee .h2 { font-size: clamp(36px,5vw,68px); line-height: 1.08; }
.mello-coffee .h2.heading-h2 { max-width: 800px; }
.mello-coffee .h2 .h2 + .h2 { margin-inline-start: .15em; }
.mello-coffee .heading-title .heading-h2,
.mello-coffee .secton-description,
.mello-coffee .block-description,
.mello-coffee .block-title { max-width: 100%; }
.mello-coffee .section-heading .text-wrapper { height: auto; }
.mello-coffee .wheel-product { display: grid; grid-template-columns: minmax(0,1.65fr) minmax(0,1fr); gap: 64px; align-items: center; }
.mello-coffee .text-and-wheel { gap: 20px; }
.mello-coffee .text-and-wheel > .vertical { flex: 0 0 32px; height: auto; max-height: 320px; }
.mello-coffee .wheel { min-width: 0; }
.mello-coffee .wheel-blocks { display: flex; }
.mello-coffee .wheel-block { flex: 1 1 0; width: 50%; padding: 24px; align-items: center; justify-content: center; min-height: 180px; }
.mello-coffee .wheel-text { max-width: 160px; }
.mello-coffee .wheel-text .display-s { font-size: clamp(20px,2.2vw,28px); }
.mello-coffee .wheel-center { pointer-events: none; }
.mello-coffee .wheel-circle { width: 56px; padding: 16px; }
.mello-coffee .wheel-illu-arrow { display: none; }
.mello-coffee .time-wrapper-content { padding: 28px; gap: 28px; }
.mello-coffee .time-wrapper-info { display: grid; grid-template-columns: minmax(0,1.6fr) minmax(0,1fr); gap: 40px; align-items: center; }
.mello-coffee .time { flex-wrap: wrap; align-items: baseline; gap: 8px; }
.mello-coffee .time .display-l { font-size: clamp(64px,10vw,144px); }
.mello-coffee .illustration-and-text { padding: 0; gap: 24px; }
.mello-coffee .time-tab { min-width: 0; padding: 20px; gap: 12px; }
.mello-coffee .time-name { min-width: 0; }
.mello-coffee .philosophy-content { display: grid; grid-template-columns: minmax(0,1.5fr) minmax(0,1fr); gap: 64px; }
.mello-coffee .receipt-wrapper { justify-self: end; min-width: 0; max-width: 100%; }
.mello-coffee .receipt { max-width: 100%; }
.mello-coffee :is(.receipt-1-illu,.receipt-2-illu,.receipt-3-illu,.receipt-4-illu) { display: none; }
.mello-coffee .receipt-item,.mello-coffee .receipt-total { display: grid; grid-template-columns: minmax(0,1fr) minmax(0,1fr); gap: 16px; }
.mello-coffee .receipt-item > *, .mello-coffee .receipt-total > * { min-width: 0; overflow-wrap: anywhere; }
.mello-coffee .spot { display: flex; align-items: stretch; }
.mello-coffee .spot > .w-tab-content { width: 100%; }
.mello-coffee .spot-content { grid-template-columns: minmax(0,1.6fr) minmax(0,1fr); grid-template-rows: auto; align-items: stretch; }
.mello-coffee .spot-info { height: auto; }
.mello-coffee .spot-image { width: 100%; min-width: 0; aspect-ratio: auto; height: auto; min-height: 440px; }
.mello-coffee .spot-details { height: auto; min-height: 440px; gap: 32px; }
.mello-coffee .spot-tabs { display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); margin-top: 0; }
.mello-coffee .spot-tab { min-width: 0; padding: 20px; align-items: baseline; }
.mello-coffee .spot-tab:not(.w--current) { color: var(--mello-accent-ink); }
.mello-coffee .hashtags { flex-wrap: wrap; }
.mello-coffee .hotspot-wrapper._1 { top: 65%; left: 15%; bottom: auto; }
.mello-coffee .hotspot-wrapper._2 { top: 50%; left: 65%; right: auto; bottom: auto; }
.mello-coffee .hotspot-wrapper._3 { top: 25%; left: 20%; bottom: auto; }
.mello-coffee .hotspot-wrapper._4 { top: 20%; left: 65%; }
.mello-coffee .image.background-image,.mello-coffee .image.bg-image { height: 100%; }
.mello-coffee .hotspot-content { aspect-ratio: auto; min-width: 48px; width: max-content; max-width: 96px; min-height: 48px; padding: 10px; }
.mello-coffee .visit-info { display: grid; grid-template-columns: minmax(0,1fr) minmax(0,1.3fr) minmax(0,1fr); height: auto; align-items: stretch; }
.mello-coffee .column.second { display: flex; flex-direction: column; }
.mello-coffee :is(.photo-block-wrapper,.p-block-wrapper) { height: auto; }
.mello-coffee .photo-image-wrapper { min-height: 220px; }
.mello-coffee .visit-info > .photo-block-wrapper .photo-image-wrapper { min-height: 420px; }
.mello-coffee .contact-items { display: grid; grid-template-columns: minmax(0,1fr); }
.mello-coffee .location-block { flex-basis: 100%; padding: 24px; }
.mello-coffee .location-info { min-width: 0; gap: 24px; }
.mello-coffee .email-block { width: 100%; flex-direction: row; padding: 20px; }
.mello-coffee .h3.email-block-text { position: static; width: auto; transform: none; }
.mello-coffee .hours-block { padding: 24px; gap: 12px; }
.mello-coffee .hours-block .block-text-wrapper { min-width: 0; }
.mello-coffee .buttons-wrapper { flex-wrap: wrap; }
/* Contrast follows the actual surface, including confirmed customer copy. */
.mello-coffee :is(.section.black,.time-wrapper,.illustration-featured-menu-block.w-variant-faaa4315-b712-1925-827e-0cc7395f755f) { color: var(--white); }
.mello-coffee :is(.section.black,.time-wrapper,.spot,.illustration-featured-menu-block,.image-featured-menu-block) p { color: inherit; }
.mello-coffee .section.black .h2.accent,
.mello-coffee .time { color: color-mix(in srgb,var(--accent) 30%,var(--white)); }
.mello-coffee .section.black .circle { background: var(--white); }
.mello-coffee :is(.ticker,.spot,.location-block,.email-block,.badge,.illustration-featured-menu-block) { color: var(--mello-accent-ink); }
.mello-coffee .button:not(.w-variant-c95095ce-7382-225f-41af-d39d3577dbad):not(.w-variant-4be33950-fd64-2206-c3d4-b88ff314674c) { color: var(--mello-accent-ink); }
.mello-coffee .wheel-block.active,
.mello-coffee .wheel-block.active .wheel-text :is(.display-s,.handwritten-s) { color: var(--mello-accent-ink) !important; }
.mello-coffee .spot .handwritten-s.opacity { color: inherit; }
.mello-coffee :is(.ticker-illu,.wheel-center-illu,.location-block-illu,.email-block-illu,.spot-illu) { filter: var(--mello-accent-icon); }
.mello-coffee .time-tab.w--current { background: var(--accent) !important; color: var(--mello-accent-ink); }
.mello-coffee .time-tab.w--current .time-tab-illu { filter: var(--mello-accent-icon); }
.mello-coffee :is(.hotspot-content,.product-block,.receipt,.photo-block,.hours-block) { color: var(--black); }
/* Material-generated collection and company facts share the template gutters. */
.mello-coffee :is(.wr-confirmed-products,.wr-confirmed-company) { width: 100%; max-width: 1328px; margin: 0 auto; padding: 64px; }
.mello-coffee .wr-confirmed-products > h2 { font-size: clamp(36px,5vw,68px); margin: 0 0 32px; }
.mello-coffee .wr-confirmed-company > p { max-width: 800px; }
@media (max-width:991px) {
  .mello-coffee .wheel-product { grid-template-columns: minmax(0,1.3fr) minmax(0,1fr); gap: 32px; }
  .mello-coffee .text-and-wheel { flex-direction: column; }
  .mello-coffee .text-and-wheel > .vertical { position: static; writing-mode: horizontal-tb; transform: none; flex-basis: auto; width: 100%; max-height: none; }
  .mello-coffee .wheel-block { min-height: 160px; padding: 20px; }
  .mello-coffee .section-heading:not(.default),.mello-coffee .philosophy-content { gap: 32px; }
  .mello-coffee .time-wrapper-info { grid-template-columns: minmax(0,1fr) minmax(0,1fr); }
  .mello-coffee .visit-info { grid-template-columns: repeat(2,minmax(0,1fr)); }
  .mello-coffee .visit-info > .column:last-child { grid-column: 1 / -1; display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); }
  .mello-coffee .time-tabs,.mello-coffee .spot-tabs { grid-template-columns: repeat(2,minmax(0,1fr)); }
  .mello-coffee :is(.wr-confirmed-products,.wr-confirmed-company) { padding: 48px 32px; }
}
@media (max-width:767px) {
  .mello-coffee .section-heading:not(.default),.mello-coffee .wheel-product,.mello-coffee .time-wrapper-info,
  .mello-coffee .philosophy-content,.mello-coffee .spot-content,.mello-coffee .visit-info,
  .mello-coffee .visit-info > .column:last-child { grid-template-columns: minmax(0,1fr); }
  .mello-coffee .section-heading:not(.default) { gap: 24px; }
  .mello-coffee .wheel-product { gap: 32px; }
  .mello-coffee .mood-content { gap: 48px; }
  .mello-coffee .text-and-wheel > .vertical { width: 100%; max-width: none; }
  .mello-coffee .wheel { background: transparent; gap: 12px; }
  .mello-coffee .wheel-blocks { gap: 12px; }
  .mello-coffee .wheel-block { border-radius: 20px; aspect-ratio: auto; min-height: 132px; padding: 20px 12px; }
  .mello-coffee .wheel-text .display-s { font-size: 20px; }
  .mello-coffee .wheel-center,.mello-coffee .wheel-illu { display: none; }
  .mello-coffee .product-block-wrapper { justify-content: center; }
  .mello-coffee .receipt-wrapper { justify-self: center; }
  .mello-coffee .time-wrapper-content { padding: 24px 20px; }
  .mello-coffee .time-wrapper-info { gap: 24px; }
  .mello-coffee .time-tab { padding: 16px; }
  .mello-coffee .time-tab-illu { display: none; }
  .mello-coffee .spot-image { min-height: 300px; }
  .mello-coffee .spot-details { min-height: 0; padding: 24px; }
  .mello-coffee .spot-tab { padding: 16px; flex-direction: column; align-items: flex-start; gap: 8px; }
  .mello-coffee .spot-tab .display-s { min-width: 0; max-width: 100%; overflow-wrap: anywhere; }
  .mello-coffee .visit-section-1,.mello-coffee .visit-section-2 { display: none; }
  .mello-coffee .photo-image-wrapper,.mello-coffee .visit-info > .photo-block-wrapper .photo-image-wrapper { min-height: 280px; }
  .mello-coffee :is(.wr-confirmed-products,.wr-confirmed-company) { padding: 40px 20px; }
}
@media (max-width:991px) {
  .mello-coffee .menu-row { gap: 40px; }
  .mello-coffee .hero-content { gap: 48px; }
}
@media (max-width:767px) {
  .mello-coffee .menu-row { grid-template-columns: minmax(0,1fr); gap: 40px; }
  .mello-coffee .menu-categories { gap: 40px; }
  .mello-coffee .menu-section-content { gap: 48px; }
  .mello-coffee .text-and-volume-wrapper,
  .mello-coffee .menu-item,
  .mello-coffee .volumes-wrapper { gap: 12px; }
  .mello-coffee .volume-text { flex-basis: 48px; width: 48px; }
  .mello-coffee .hero-text .hero-h1 { font-size: clamp(40px,10vw,64px); }
  .mello-coffee div.hero-image { grid-template-columns: minmax(0,1fr); gap: 16px; }
  .mello-coffee .hero-image > .quality-badge { justify-self: start; }
  .mello-coffee .hero-image > .image { grid-row: auto; order: 1; }
}
`;
