/** Semantic layout rules shared by previews and published Mello pages. */
export const melloLayoutStyles = `
.mello-coffee { --mello-accent-ink: #17261c; --mello-accent-icon: none; }
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
