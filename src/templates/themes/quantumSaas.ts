import type { Product } from '../../shared/model';
import { esc, safeUrl, type ThemeContext } from './types';

// =====================================================================
// QUANTUM² THEME IMPLEMENTATION FOR WEB-RADAR
// =====================================================================

export const QUANTUM_LOGO_SVG = `<svg class="logo" viewBox="0 0 26 25" fill="none" aria-label="Quantum squared">
  <path fill-rule="evenodd" d="M9.45 24.95 L7.07 24.09 L5.56 23.30 L3.33 21.03 L2.31 19.44 L0.74 16.05 L0.27 13.91 L0.29 11.25 L0.80 8.75 L1.95 6.20 L3.26 4.50 L5.15 2.67 L7.77 1.02 L9.91 0.18 L12.16 -0.20 L15.22 -0.16 L17.61 0.35 L19.30 1.06 L20.88 2.06 L22.23 3.37 L24.01 5.48 L24.76 6.58 L25.70 8.63 L26.00 10.35 L26.02 11.35 L25.54 12.12 L24.96 12.32 L22.35 12.36 L21.46 12.18 L20.78 11.85 L20.32 11.37 L19.45 9.56 L17.88 7.58 L16.59 6.60 L14.59 5.84 L13.24 5.69 L11.54 5.93 L10.47 6.44 L9.12 7.35 L7.92 8.50 L6.70 10.55 L6.26 12.65 L6.41 14.36 L7.14 15.86 L8.63 17.79 L12.57 20.70 L12.96 21.60 L13.13 22.82 L12.93 24.36 L12.65 24.86 L12.03 25.35 L11.27 25.42 L9.45 24.95 Z M24.55 25.53 L22.49 24.77 L19.56 23.18 L18.15 22.07 L16.63 20.48 L16.14 19.79 L15.63 18.71 L14.66 15.66 L14.59 14.50 L14.75 13.92 L15.12 13.45 L15.85 13.10 L16.91 12.88 L18.90 12.85 L19.49 13.04 L19.94 13.38 L20.25 13.88 L20.86 15.66 L21.97 17.30 L23.05 18.22 L25.00 19.43 L26.05 20.27 L26.34 20.66 L26.63 21.86 L26.51 23.68 L25.79 25.10 L25.35 25.42 L24.55 25.53 Z" fill="#38c6ec"/>
</svg>`;

export const QUANTUM_VIDEO_URL = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260826_125119_4963ddd4-c287-4044-b014-b68943cdd8bd.mp4";
export const QUANTUM_POSTER_URL = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260826_125039_45a71f04-36dd-4620-99d8-7526316d439e.png";

export const AVATAR_1 = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><rect width='40' height='40' fill='%238d6a52'/><circle cx='20' cy='16' r='9' fill='%23d9a882'/><ellipse cx='20' cy='38' rx='14' ry='13' fill='%233c3a44'/></svg>";
export const AVATAR_2 = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><rect width='40' height='40' fill='%23b9b3ad'/><circle cx='20' cy='15' r='9' fill='%23e8c4a0'/><ellipse cx='20' cy='38' rx='14' ry='13' fill='%23786f66'/></svg>";
export const AVATAR_3 = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><rect width='40' height='40' fill='%23a08b7a'/><circle cx='20' cy='16' r='9' fill='%23dda882'/><ellipse cx='20' cy='38' rx='14' ry='13' fill='%236b4f3f'/></svg>";

export function renderQuantumSite(ctx: ThemeContext): string {
  const { draft, page, path, navAttrs } = ctx;
  const isHome = page === 'home';
  const pageTitle = isHome
    ? 'Quantum² — Convert screen recording into clear, intelligent insights'
    : `${page.toUpperCase()} — Quantum²`;

  return `<!doctype html>
<html lang="${ctx.lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${esc(pageTitle)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Figtree:wght@100..900&display=block" rel="stylesheet">
  <style>
    :root {
      --font-sans: 'Figtree', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
      --fs-display : 55.7px;
      --fs-title   : calc(var(--dp) * 20);
      --fs-heading : calc(var(--dp) * 17);
      --fs-body    : 16.1px;
      --fs-eyebrow : calc(var(--dp) * 15.8);
      --fs-ui      : 15px;
      --fs-meta    : calc(var(--dp) * 14.3);
      --fs-item    : calc(var(--dp) * 12.9);
      --fs-caption : calc(var(--dp) * 12.2);
      --fs-tab     : calc(var(--dp) * 12.1);
      --fs-sup     : 11.4px;
      --fs-wordmark: 17.1px;

      --fw-light    : 388;
      --fw-regular  : 470;
      --fw-medium   : 500;
      --fw-semibold : 511;
      --fw-bold     : 577;
      --fw-black    : 783;

      --tr-display : -0.0572em;
      --tr-title   : -0.0570em;
      --tr-heading : -0.0200em;
      --tr-body    : -0.0475em;
      --tr-eyebrow : -0.0293em;
      --tr-ui      : -0.0080em;
      --tr-cta     : -0.0200em;
      --tr-meta    : -0.0447em;
      --tr-item    : -0.0287em;
      --tr-caption : -0.0295em;
      --tr-tab     : -0.0398em;
      --tr-wordmark: -0.0075em;

      --lh-display : 61px;
      --lh-body    : 20px;
      --lh-flat    : 1;
      --lh-display-ratio : 1.1;
      --lh-body-ratio    : 1.45;

      --c-ink      : #000000;
      --c-ink-soft : #2e2e2e;
      --c-muted    : #b8b8b8;
      --c-on-dark  : #ffffff;
      --c-on-light : #000000;
      --c-surface-nav   : #000000;
      --c-surface-card  : #f2f2f2;
      --c-surface-panel : #ffffff;
      --c-border-row    : #ededed;
      --c-accent        : #38c6ec;

      --u  : 548px;
      --dp : calc(var(--u) / 548);

      --ease-reveal : cubic-bezier(.22, 1, .36, 1);
      --ease-settle : cubic-bezier(.16, 1, .30, 1);
      --dur-nav     : .62s;
      --dur-navitem : .5s;
      --dur-head    : .92s;
      --dur-copy    : .62s;
      --dur-cta     : .58s;
      --dur-panel   : .94s;
    }

    *, *::before, *::after { box-sizing: border-box; }
    html, body {
      margin: 0; padding: 0;
      background: #fff; color: var(--c-ink);
      font-family: var(--font-sans);
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      text-rendering: geometricPrecision;
      overflow-x: hidden;
    }

    ${isHome ? `
      html, body { height: 100%; overflow: hidden; }
      #viewport { position: fixed; inset: 0; overflow: hidden; background: #fff; }
      #stage {
        position: absolute; top: 0; left: 0;
        width: 1290px; height: 860px;
        transform-origin: 0 0; background: #fff;
      }
    ` : `
      .subpage-container {
        min-height: 100vh;
        display: flex; flex-direction: column;
        background: #fff;
      }
      .subpage-header-wrap {
        position: sticky; top: 0; z-index: 1000;
        padding-top: calc(43px * var(--nav-scale, 1));
        padding-bottom: 12px;
        display: flex; justify-content: center;
        width: 100%; pointer-events: none;
        transition: padding-top .15s ease;
      }
    `}

    /* Typography Utility Classes */
    .t-display { font-size: var(--fs-display); font-weight: var(--fw-regular); letter-spacing: var(--tr-display); line-height: var(--lh-display); color: var(--c-ink); }
    .t-body { font-size: var(--fs-body); font-weight: var(--fw-regular); letter-spacing: var(--tr-body); line-height: var(--lh-body); color: var(--c-ink); }
    .t-title { font-size: var(--fs-title); font-weight: var(--fw-light); letter-spacing: var(--tr-title); line-height: var(--lh-flat); color: var(--c-ink); }
    .t-heading { font-size: var(--fs-heading); font-weight: var(--fw-semibold); letter-spacing: var(--tr-heading); line-height: var(--lh-flat); color: var(--c-ink); }
    .t-eyebrow { font-size: var(--fs-eyebrow); font-weight: var(--fw-light); letter-spacing: var(--tr-eyebrow); line-height: var(--lh-flat); color: var(--c-ink); }
    .t-meta { font-size: var(--fs-meta); font-weight: var(--fw-light); letter-spacing: var(--tr-meta); line-height: var(--lh-flat); color: var(--c-muted); }
    .t-item { font-size: var(--fs-item); font-weight: var(--fw-medium); letter-spacing: var(--tr-item); line-height: var(--lh-flat); color: var(--c-ink); }
    .t-caption { font-size: var(--fs-caption); font-weight: var(--fw-light); letter-spacing: var(--tr-caption); line-height: var(--lh-flat); color: var(--c-muted); }

    /* =====================================================================
       NAVBAR (PIXEL CONTRACT: IDENTICAL ACROSS ALL PAGES)
       ===================================================================== */
    .nav {
      width: 880px; height: 52px;
      background: var(--c-surface-nav);
      border-radius: 26px;
      position: relative;
      user-select: none;
    }
    ${isHome ? `
      .nav {
        position: absolute;
        left: calc(50% - 439px);
        top: 43px;
      }
    ` : `
      .nav {
        pointer-events: auto;
        margin: 0;
        transform: scale(var(--nav-scale, 1));
        transform-origin: top center;
        box-shadow: 0 12px 36px rgba(0, 0, 0, 0.22);
      }
    `}

    .nav .logo {
      position: absolute; left: 9px; top: 13px;
      width: 26px; height: 25px;
    }

    .wordmark {
      position: absolute; left: 40px; top: 2px; height: 52px;
      display: flex; align-items: center;
      font-size: var(--fs-wordmark); font-weight: var(--fw-black); letter-spacing: var(--tr-wordmark);
      color: var(--c-on-dark); white-space: nowrap; text-decoration: none;
    }
    .wordmark sup {
      font-size: var(--fs-sup); font-weight: var(--fw-black);
      position: relative; top: -5px; left: 1px;
    }

    .nav a.link {
      position: absolute; top: 0; height: 52px;
      display: flex; align-items: center; transform: translateX(-50%);
      font-size: var(--fs-ui); font-weight: var(--fw-medium); letter-spacing: var(--tr-ui);
      color: var(--c-on-dark); text-decoration: none; white-space: nowrap;
      transition: color .2s ease;
    }
    .nav a.link:hover, .nav a.link.is-active {
      color: var(--c-accent);
    }
    .link.l1 { left: 279px; }
    .link.l2 { left: 386.5px; }
    .link.l3 { left: 483px; }
    .link.l4 { left: 571px; }

    .btn {
      border: 0; border-radius: 17px; height: 34px;
      display: flex; align-items: center; justify-content: center;
      font-family: inherit; font-size: var(--fs-ui); letter-spacing: var(--tr-cta);
      line-height: var(--lh-flat); white-space: nowrap; cursor: pointer; text-decoration: none;
    }
    .btn--nav {
      position: absolute; left: 718px; top: 9px; width: 153px;
      background: var(--c-on-dark); color: var(--c-on-light); font-weight: var(--fw-bold);
      transition: transform .2s ease, background-color .2s ease;
    }
    .btn--nav:hover {
      transform: translateY(-1px); background: #f0f0f0;
    }

    .btn--hero {
      position: absolute; left: calc(50% - 64px); top: calc(388px + var(--dsk-hero-dy, 0px));
      width: 129px; background: var(--c-ink); color: var(--c-on-dark); font-weight: var(--fw-medium);
      transition: transform .2s ease, opacity .2s ease;
    }
    .btn--hero:hover {
      transform: translateY(-1px); opacity: .92;
    }

    .burger { display: none; }
    .navmenu { display: none; }

    /* =====================================================================
       HERO & STAGE (DESKTOP)
       ===================================================================== */
    .hero-h1 {
      position: absolute; left: 0; right: 0; top: calc(203px + var(--dsk-hero-dy, 0px));
      margin: 0; text-align: center; white-space: pre-line;
    }
    .hero-sub {
      position: absolute; left: 0; right: 0; top: calc(333px + var(--dsk-hero-dy, 0px));
      margin: 0; text-align: center; white-space: pre-line;
    }

    .band {
      position: absolute; left: 0; right: 0; top: calc(473px + var(--dsk-band-dy, 0px)); bottom: 0;
      border-radius: 0; overflow: hidden; background-color: #0db5ed;
    }
    .band__video {
      position: absolute; inset: 0; width: 100%; height: 100%;
      object-fit: cover; object-position: center top; z-index: 0;
    }

    /* Fixed Geometry Mockup Card */
    .card {
      position: absolute; left: calc(50% - 273px); top: calc(549px + var(--dsk-band-dy, 0px));
      width: var(--u); height: calc(var(--dp) * 340);
      transform: scale(var(--dsk-card-s, 1)); transform-origin: top center;
      background: var(--c-surface-card); border-radius: calc(var(--dp) * 16);
      overflow: hidden;
      box-shadow:
        0 0 0 1px rgba(255,255,255,.6),
        0 0 calc(var(--dp) * 9) calc(var(--dp) * 3) rgba(255,255,255,.5),
        0 calc(var(--dp) * 22) calc(var(--dp) * 64) rgba(2,72,105,.16);
      z-index: 2;
    }

    .card .eyebrow {
      position: absolute; left: calc(var(--dp) * 19); top: calc(var(--dp) * 21);
      white-space: nowrap;
    }
    .card .cardtitle {
      position: absolute; left: calc(var(--dp) * 18); top: calc(var(--dp) * 47);
      white-space: nowrap;
    }
    .card .meta {
      position: absolute; left: calc(var(--dp) * 15); top: calc(var(--dp) * 81);
      height: calc(var(--dp) * 28);
    }
    .card .avatars {
      position: absolute; left: 0; top: 0; height: calc(var(--dp) * 28);
    }
    .card .av {
      position: absolute; width: calc(var(--dp) * 28); height: calc(var(--dp) * 28);
      border-radius: 50%; border: max(1px, calc(var(--dp) * 2)) solid #fff;
      background-size: cover;
    }
    .card .av1 { left: 0; background-image: url('${AVATAR_1}'); }
    .card .av2 { left: calc(var(--dp) * 11); background-image: url('${AVATAR_2}'); }
    .card .av3 { left: calc(var(--dp) * 22); background-image: url('${AVATAR_3}'); }

    .card .clockicon {
      position: absolute; left: calc(var(--dp) * 66); top: calc(var(--dp) * 5);
      width: calc(var(--dp) * 14); height: calc(var(--dp) * 14);
    }
    .card .metatext {
      position: absolute; left: calc(var(--dp) * 89); top: calc(var(--dp) * -2);
      height: calc(var(--dp) * 28); display: flex; align-items: center; white-space: nowrap;
    }
    .sep { padding: 0 calc(var(--dp) * 10); }

    .tabs {
      position: absolute; left: 0; right: 0; top: calc(var(--dp) * 129);
      height: calc(var(--dp) * 30);
    }
    .tab {
      position: absolute; top: 0; height: calc(var(--dp) * 30);
      display: flex; align-items: center; font-family: inherit;
      font-size: var(--fs-tab); font-weight: var(--fw-light); letter-spacing: var(--tr-tab);
      color: var(--c-muted); border: 0; background: transparent; padding: 0; white-space: nowrap;
    }
    .tab.is-active {
      left: calc(var(--dp) * 19); padding: 0 calc(var(--dp) * 18);
      font-weight: var(--fw-medium); color: var(--c-ink-soft);
      background: #fff; border-radius: calc(var(--dp) * 8) calc(var(--dp) * 8) 0 0;
    }
    .tab.is-active::after {
      content: ""; position: absolute; bottom: 0;
      left: calc(var(--dp) * 12); right: calc(var(--dp) * 13);
      height: max(1px, calc(var(--dp) * 2)); background: var(--c-accent);
    }
    .t2 { left: calc(var(--dp) * 148); }
    .t3 { left: calc(var(--dp) * 239); }
    .t4 { left: calc(var(--dp) * 341); }

    .panel {
      position: absolute; left: calc(var(--dp) * 19); top: calc(var(--dp) * 160);
      width: calc(var(--dp) * 511); height: calc(var(--dp) * 169);
      background: var(--c-surface-panel); border-radius: 0 calc(var(--dp) * 8) calc(var(--dp) * 8) calc(var(--dp) * 8);
    }
    .panel__heading {
      position: absolute; left: calc(var(--dp) * 12); top: calc(var(--dp) * 10); white-space: nowrap;
    }
    .row {
      position: absolute; left: calc(var(--dp) * 13); width: calc(var(--dp) * 485); height: calc(var(--dp) * 46);
      background: #fff; border: 1px solid var(--c-border-row); border-radius: calc(var(--dp) * 8);
      box-shadow: 0 1px calc(var(--dp) * 2) rgba(0,0,0,.03);
    }
    .row1 { top: calc(var(--dp) * 36); }
    .row2 { top: calc(var(--dp) * 87); }

    .dot {
      position: absolute; left: calc(var(--dp) * 7); top: calc(var(--dp) * 7);
      width: calc(var(--dp) * 15); height: calc(var(--dp) * 15);
    }
    .rowtitle {
      position: absolute; left: calc(var(--dp) * 33); top: calc(var(--dp) * 10); white-space: nowrap;
    }
    .rowowner {
      position: absolute; left: calc(var(--dp) * 33); top: calc(var(--dp) * 27); white-space: nowrap;
    }

    /* =====================================================================
       ENTRANCE ANIMATION
       ===================================================================== */
    @keyframes enter-wipe   { from { clip-path: inset(0 0 100% 0); } to { clip-path: inset(0 0 0% 0); } }
    @keyframes enter-drop   { from { opacity: 0; translate: 0 -10px; } to { opacity: 1; translate: 0 0; } }
    @keyframes enter-rise14 { from { opacity: 0; translate: 0 14px; } to { opacity: 1; translate: 0 0; } }
    @keyframes enter-rise22 { from { opacity: 0; translate: 0 22px; } to { opacity: 1; translate: 0 0; } }
    @keyframes enter-fade   { from { opacity: 0; } to { opacity: 1; } }

    [data-enter="pending"] .hero-h1 { clip-path: inset(0 0 100% 0); }
    [data-enter="pending"] .nav { opacity: 0; translate: 0 -10px; }
    [data-enter="pending"] .hero-sub { opacity: 0; translate: 0 14px; }
    [data-enter="pending"] .btn--hero { opacity: 0; translate: 0 14px; }
    [data-enter="pending"] .card { opacity: 0; translate: 0 22px; }
    [data-enter="pending"] .logo,
    [data-enter="pending"] .wordmark,
    [data-enter="pending"] .nav a.link,
    [data-enter="pending"] .btn--nav { opacity: 0; }

    [data-enter="run"] .nav       { animation: enter-drop var(--dur-nav) var(--ease-settle) .05s both; }
    [data-enter="run"] .logo      { animation: enter-fade var(--dur-navitem) var(--ease-settle) .18s both; }
    [data-enter="run"] .wordmark  { animation: enter-fade var(--dur-navitem) var(--ease-settle) .22s both; }
    [data-enter="run"] .link.l1   { animation: enter-fade var(--dur-navitem) var(--ease-settle) .26s both; }
    [data-enter="run"] .link.l2   { animation: enter-fade var(--dur-navitem) var(--ease-settle) .30s both; }
    [data-enter="run"] .link.l3   { animation: enter-fade var(--dur-navitem) var(--ease-settle) .34s both; }
    [data-enter="run"] .link.l4   { animation: enter-fade var(--dur-navitem) var(--ease-settle) .38s both; }
    [data-enter="run"] .btn--nav  { animation: enter-fade var(--dur-navitem) var(--ease-settle) .42s both; }
    [data-enter="run"] .hero-h1   { animation: enter-wipe var(--dur-head) var(--ease-reveal) .30s both; }
    [data-enter="run"] .hero-sub  { animation: enter-rise14 var(--dur-copy) var(--ease-settle) .62s both; }
    [data-enter="run"] .btn--hero { animation: enter-rise14 var(--dur-cta) var(--ease-settle) .78s both; }
    [data-enter="run"] .card      { animation: enter-rise22 var(--dur-panel) var(--ease-settle) .88s both; }

    /* =====================================================================
       COMPACT / MOBILE FLOW (< 940px)
       ===================================================================== */
    @media (max-width: 939.98px) {
      :root {
        --page-margin  : clamp(16px, 3.4vw, 34px);
        --fs-display-t : clamp(31px, 3.2vw + 1.6vh, 54px);
        --fs-body-t    : clamp(14px, 0.9vw + 0.5vh, 16.1px);
        --gap-stack    : clamp(14px, 2.4vh, 26px);
        --card-inset   : clamp(24px, 5.5vh, 76px);
        --u            : max(min(280px, 90vw), min(80vw, max(calc(1039px - 50.3vw), 60vh)));
        --card-h       : calc(var(--dp) * 340);
        --band-h       : min(calc(var(--card-inset) + var(--card-h) * .9), 52vh);
      }

      html, body { overflow: hidden; }
      #viewport { position: fixed; inset: 0; overflow: hidden; }
      #stage {
        position: static; width: 100%; height: 100dvh;
        transform: none !important;
        display: grid; grid-template-columns: 100%;
        grid-template-rows:
          auto
          minmax(clamp(20px, 3.5vh, 44px), 1fr)
          auto auto auto
          minmax(clamp(16px, 2.4vh, 30px), .85fr)
          minmax(0, var(--band-h));
        grid-template-areas: "nav" "." "head" "sub" "cta" "." "art";
        padding-top: clamp(20px, 3.4vw, 43px);
      }

      .nav {
        position: relative; grid-area: nav; left: auto; top: auto;
        height: 52px; width: min(calc(100% - 2 * var(--page-margin)), 820px);
        margin: 0 auto; display: flex; align-items: center; z-index: 20;
      }
      .nav a.link, .btn--nav { display: none !important; }
      .nav .logo { position: static; margin-left: 9px; flex: none; }
      .wordmark { position: static; height: auto; margin-left: 6px; }

      .burger {
        display: flex; flex-direction: column; justify-content: center; gap: 5px;
        margin-left: auto; margin-right: 9px; width: 34px; height: 34px; padding: 0 7px;
        background: none; border: 0; border-radius: 17px; cursor: pointer;
        -webkit-tap-highlight-color: transparent;
      }
      .burger__bar {
        display: block; height: 2px; width: 100%; background: #fff; border-radius: 1px;
        transition: transform .22s ease, opacity .22s ease;
      }
      .burger:focus-visible { outline: 2px solid #38c6ec; outline-offset: 2px; }
      .nav.is-open .burger__bar:nth-child(1) { transform: translateY(3.5px) rotate(45deg); }
      .nav.is-open .burger__bar:nth-child(2) { transform: translateY(-3.5px) rotate(-45deg); }

      .navmenu {
        display: flex; flex-direction: column;
        position: absolute; top: calc(100% + 8px); right: 0;
        min-width: 216px; padding: 10px; background: #000; border-radius: 20px;
        opacity: 0; transform: translateY(-6px);
        transition: opacity .2s ease, transform .2s ease; pointer-events: none;
      }
      .navmenu[hidden] { display: flex; }
      .nav.is-open .navmenu { opacity: 1; transform: none; pointer-events: auto; }
      .navmenu__link {
        padding: 11px 14px; border-radius: 12px;
        font-size: var(--fs-ui); font-weight: var(--fw-medium); letter-spacing: var(--tr-ui);
        color: var(--c-on-dark); text-decoration: none;
      }
      .navmenu__link:hover, .navmenu__link:focus { background: rgba(255,255,255,.1); }
      .navmenu__cta {
        margin-top: 6px; padding: 11px 14px; background: #fff; border-radius: 17px;
        text-align: center; font-size: var(--fs-ui); font-weight: var(--fw-bold);
        color: var(--c-on-light); text-decoration: none;
      }

      .hero-h1 {
        grid-area: head; position: static;
        margin: 0 var(--page-margin); margin-inline: auto;
        max-width: calc(100% - 2 * var(--page-margin));
        font-size: var(--fs-display-t); line-height: 1.1;
        white-space: pre-line; text-wrap: balance;
      }
      .hero-sub {
        grid-area: sub; position: static;
        margin: var(--gap-stack) auto 0;
        max-width: min(52ch, calc(100% - 2 * var(--page-margin)));
        font-size: var(--fs-body-t); line-height: 1.45; letter-spacing: var(--tr-body);
        white-space: normal; text-wrap: balance;
      }
      .btn--hero {
        grid-area: cta; position: static; justify-self: center;
        margin-top: calc(var(--gap-stack) * 1.4); left: auto; top: auto;
      }

      .band {
        grid-area: art; position: relative; left: auto; right: auto; top: auto; bottom: auto;
        margin: 0; min-height: 0;
      }
      .card {
        grid-area: art;
        position: relative; justify-self: center; align-self: start;
        left: auto; top: auto; margin-top: var(--card-inset); transform: none;
      }
    }

    @media (max-width: 479.98px) {
      .hero-h1 { white-space: normal; text-wrap: balance; }
    }

    @media (max-height: 520px) {
      :root { --band-h: calc(var(--card-h) + 2 * var(--card-inset)); }
      html, body { height: auto; min-height: 100%; overflow: visible; }
      #viewport { position: static; overflow: visible; }
      #stage { height: auto; min-height: 100dvh; }
    }

    @media (prefers-reduced-motion: reduce) {
      * { animation: none !important; transition: none !important; }
      .navmenu, .burger__bar { transition: none; }
    }
  </style>
  <script>
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.documentElement.setAttribute('data-enter', 'pending');
    }
  </script>
</head>
<body>
  ${isHome ? `
  <div id="viewport">
    <div id="stage">
      <!-- 1. Nav Pill -->
      <nav class="nav">
        ${QUANTUM_LOGO_SVG}
        <a class="wordmark" href="${path('index.html')}" ${navAttrs('home')}>
          Quantum<sup>2</sup>
        </a>

        <a class="link l1" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>Product</a>
        <a class="link l2" href="${path('about/index.html')}" ${navAttrs('about')}>Pricing</a>
        <a class="link l3" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>Blog</a>
        <a class="link l4" href="${path('contact/index.html')}" ${navAttrs('contact')}>FAQ</a>

        <a class="btn btn--nav" href="${path('contact/index.html')}" ${navAttrs('contact')}>Download Now</a>

        <button class="burger" id="burgerBtn" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="nav-menu">
          <span class="burger__bar"></span>
          <span class="burger__bar"></span>
        </button>

        <div class="navmenu" id="nav-menu" hidden>
          <a class="navmenu__link" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>Product</a>
          <a class="navmenu__link" href="${path('about/index.html')}" ${navAttrs('about')}>Pricing</a>
          <a class="navmenu__link" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>Blog</a>
          <a class="navmenu__link" href="${path('contact/index.html')}" ${navAttrs('contact')}>FAQ</a>
          <a class="navmenu__cta" href="${path('contact/index.html')}" ${navAttrs('contact')}>Download Now</a>
        </div>
      </nav>

      <!-- 2. Headline -->
      <h1 class="hero-h1 t-display">Convert Screen recording into
clear, intelligent insights</h1>

      <!-- 3. Subcopy -->
      <p class="hero-sub t-body">From screen recordings to searchable knowledge, powered by quantum AI.
Skip the manual work.</p>

      <!-- 4. Hero CTA -->
      <a class="btn btn--hero" href="${path('contact/index.html')}" ${navAttrs('contact')}>Get Started</a>

      <!-- 5. Full-bleed Cyan Video Band -->
      <div class="band" role="presentation">
        <video class="band__video" autoplay muted loop playsinline poster="${QUANTUM_POSTER_URL}">
          <source src="${QUANTUM_VIDEO_URL}" type="video/mp4">
        </video>
      </div>

      <!-- 6. Fixed-geometry Product Mockup Card -->
      <div class="card">
        <div class="eyebrow t-eyebrow"># Project Horizon 1742m/ Strategy Sync</div>
        <div class="cardtitle t-title">Outcome Review</div>

        <div class="meta">
          <div class="avatars">
            <span class="av av1"></span>
            <span class="av av2"></span>
            <span class="av av3"></span>
          </div>

          <svg class="clockicon" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="7" fill="#d9d9d9"/>
            <path d="M7 3.6V7.2l2.3 1.4" stroke="#f2f2f2" stroke-width="1.3" stroke-linecap="round"/>
          </svg>

          <div class="metatext t-meta">
            Today at 10:30 a.m. <span class="sep">&bull;</span> 45 mins <span class="sep">&bull;</span> Aligned
          </div>
        </div>

        <div class="tabs">
          <button class="tab is-active" type="button">Outcomes</button>
          <button class="tab t2" type="button">Decisions</button>
          <button class="tab t3" type="button">Action Items</button>
          <button class="tab t4" type="button">Open Questions</button>
        </div>

        <div class="panel">
          <div class="panel__heading t-heading">Key Outcomes</div>

          <div class="row row1">
            <svg class="dot" viewBox="0 0 15 15" fill="none">
              <circle cx="7.5" cy="7.5" r="7.5" fill="#2a9a30"/>
              <path d="M4.1 7.15 6.05 9.05 9.9 5.2" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            <div class="rowtitle t-item">Agreed on success metrics for Q3 launch</div>
            <div class="rowowner t-caption">Owner: Product Lead</div>
          </div>

          <div class="row row2">
            <svg class="dot" viewBox="0 0 15 15" fill="none">
              <circle cx="7.5" cy="7.5" r="7.5" fill="#f6a825"/>
              <path d="M6 5.5a1.5 1.5 0 0 1 2.8.7c0 .9-.9 1.2-1.3 1.8" stroke="#fff" stroke-width="1.25" stroke-linecap="round"/>
              <circle cx="6.97" cy="10.05" r="0.78" fill="#fff"/>
            </svg>
            <div class="rowtitle t-item">Refined the product positioning strategy pending final approval</div>
            <div class="rowowner t-caption">Owner: Marketing Manager</div>
          </div>
        </div>
      </div>
    </div>
  </div>
  ` : `
  <!-- Subpage Layout with Identical Navbar -->
  <div class="subpage-container">
    <header class="subpage-header-wrap">
      <nav class="nav">
        ${QUANTUM_LOGO_SVG}
        <a class="wordmark" href="${path('index.html')}" ${navAttrs('home')}>
          Quantum<sup>2</sup>
        </a>

        <a class="link l1 ${page === 'catalog' ? 'is-active' : ''}" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>Product</a>
        <a class="link l2 ${page === 'about' ? 'is-active' : ''}" href="${path('about/index.html')}" ${navAttrs('about')}>Pricing</a>
        <a class="link l3" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>Blog</a>
        <a class="link l4 ${page === 'contact' ? 'is-active' : ''}" href="${path('contact/index.html')}" ${navAttrs('contact')}>FAQ</a>

        <a class="btn btn--nav" href="${path('contact/index.html')}" ${navAttrs('contact')}>Download Now</a>

        <button class="burger" id="burgerBtn" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="nav-menu">
          <span class="burger__bar"></span>
          <span class="burger__bar"></span>
        </button>

        <div class="navmenu" id="nav-menu" hidden>
          <a class="navmenu__link" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>Product</a>
          <a class="navmenu__link" href="${path('about/index.html')}" ${navAttrs('about')}>Pricing</a>
          <a class="navmenu__link" href="${path('catalog/index.html')}" ${navAttrs('catalog')}>Blog</a>
          <a class="navmenu__link" href="${path('contact/index.html')}" ${navAttrs('contact')}>FAQ</a>
          <a class="navmenu__cta" href="${path('contact/index.html')}" ${navAttrs('contact')}>Download Now</a>
        </div>
      </nav>
    </header>

    <main style="max-width:1120px;margin:50px auto 100px;padding:0 24px;width:100%;">
      ${renderSubpageBody(ctx)}
    </main>

    <footer style="margin-top:auto;border-top:1px solid #ededed;padding:40px 24px;text-align:center;font-size:14px;color:#888;">
      <div style="max-width:1120px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;">
        <span style="font-weight:700;color:#000;">Quantum<sup>2</sup> Screen Intelligence</span>
        <span>© ${new Date().getUTCFullYear()} Quantum Inc. All rights reserved.</span>
      </div>
    </footer>
  </div>
  `}

  <script>
    (function () {
      // 1. Entrance animation coordinator
      try {
        if (document.fonts && document.fonts.ready) {
          document.fonts.ready.then(startEntrance);
        } else {
          setTimeout(startEntrance, 200);
        }
      } catch (e) {
        startEntrance();
      }

      var entranceStarted = false;
      function startEntrance() {
        if (entranceStarted) return;
        entranceStarted = true;
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            document.documentElement.setAttribute('data-enter', 'run');
            var card = document.querySelector('.card');
            if (card) {
              card.addEventListener('animationend', function () {
                document.documentElement.setAttribute('data-enter', 'done');
              }, { once: true });
            }
            setTimeout(function () {
              document.documentElement.setAttribute('data-enter', 'done');
            }, 3000);
          });
        });
      }

      // 2. Desktop Fit JS (>= 940px)
      var stage = document.getElementById('stage');
      var DW = 1290, DH = 860, CARD_TOP = 549, CARD_H = 340, NAV_W = 880, MINW = 960, HERO_SHARE = 0.55;

      function fitDesktop() {
        if (!stage) return;
        var vw = window.innerWidth;
        var vh = window.innerHeight;

        if (vw < 940) {
          stage.style.width = '';
          stage.style.height = '';
          stage.style.transform = '';
          document.documentElement.style.removeProperty('--dsk-card-s');
          document.documentElement.style.removeProperty('--dsk-band-dy');
          document.documentElement.style.removeProperty('--dsk-hero-dy');
          return;
        }

        var s = Math.min(vh / DH, vw / MINW);
        var W = vw / s;
        var H = vh / s;
        var csMax = Math.min(NAV_W, 0.80 * W) / 548;
        var cs = Math.max(1, Math.min((H - CARD_TOP) / CARD_H, csMax));
        var dy = Math.max(0, H - CARD_TOP - CARD_H * cs);
        var heroDy = HERO_SHARE * dy;

        stage.style.width = W + 'px';
        stage.style.height = H + 'px';
        stage.style.transform = 'scale(' + s + ')';

        document.documentElement.style.setProperty('--dsk-card-s', cs.toString());
        document.documentElement.style.setProperty('--dsk-band-dy', dy + 'px');
        document.documentElement.style.setProperty('--dsk-hero-dy', heroDy + 'px');

        // Close mobile burger menu on desktop
        var nav = document.querySelector('.nav');
        var menu = document.getElementById('nav-menu');
        var burger = document.getElementById('burgerBtn');
        if (nav && menu && burger) {
          nav.classList.remove('is-open');
          burger.setAttribute('aria-expanded', 'false');
          menu.hidden = true;
        }
      }

      function updateNavScale() {
        if (window.innerWidth < 940) {
          document.documentElement.style.removeProperty('--nav-scale');
          return;
        }
        var s = Math.min(window.innerHeight / DH, window.innerWidth / MINW);
        document.documentElement.style.setProperty('--nav-scale', s.toString());
      }

      fitDesktop();
      updateNavScale();
      window.addEventListener('resize', function () {
        fitDesktop();
        updateNavScale();
      });
      window.addEventListener('orientationchange', function () {
        fitDesktop();
        updateNavScale();
      });
      if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', function () {
          fitDesktop();
          updateNavScale();
        });
      }

      // 3. Burger JS
      var burger = document.getElementById('burgerBtn');
      var nav = document.querySelector('.nav');
      var menu = document.getElementById('nav-menu');

      if (burger && nav && menu) {
        burger.addEventListener('click', function (e) {
          e.stopPropagation();
          var isOpen = nav.classList.toggle('is-open');
          burger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
          burger.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
          menu.hidden = !isOpen;
        });

        document.addEventListener('click', function (e) {
          if (!nav.contains(e.target)) {
            nav.classList.remove('is-open');
            burger.setAttribute('aria-expanded', 'false');
            burger.setAttribute('aria-label', 'Open menu');
            menu.hidden = true;
          }
        });

        window.addEventListener('keydown', function (e) {
          if (e.key === 'Escape' || e.key === 'Esc') {
            nav.classList.remove('is-open');
            burger.setAttribute('aria-expanded', 'false');
            menu.hidden = true;
            burger.focus();
          }
        });
      }
    })();
  </script>
</body>
</html>`;
}

function renderSubpageBody(ctx: ThemeContext): string {
  const { page, draft, path, navAttrs } = ctx;
  const isZh = (ctx.lang as string) === 'zh';

  if (page === 'catalog') {
    // Product Page
    const products = draft.products.length ? draft.products : [
      { id: 'p1', name: 'Quantum Core Studio', description: 'Real-time multi-window screen recording with ultra-low CPU overhead and lossless 4K 60fps capture.', price: '$19/mo' },
      { id: 'p2', name: 'Synthesizer AI Engine', description: 'Autonomous voiceprint separation, audio cleaning, and automatic outcome & task assignment extraction.', price: '$29/mo' },
      { id: 'p3', name: 'Enterprise Insight Vault', description: 'SOC2 Type II encrypted video knowledge repository with semantic instant vector search across all team recordings.', price: 'Enterprise' },
      { id: 'p4', name: 'Linear & Jira Synced Bridge', description: 'One-click conversion from screen-recorded decisions to production bug tickets and sprint milestones.', price: 'Included' },
    ];

    return `
      <section style="text-align:center;margin-bottom:60px;">
        <span style="display:inline-block;padding:4px 14px;border-radius:999px;background:rgba(56,198,236,0.12);color:#0891b2;font-size:13px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;margin-bottom:16px;">
          Product Capabilities
        </span>
        <h1 style="font-size:clamp(2.2rem,4vw,3.6rem);font-weight:700;letter-spacing:-0.03em;margin:0 0 16px;">Intelligent Video-to-Knowledge Infrastructure</h1>
        <p style="font-size:18px;color:#555;max-width:62ch;margin:0 auto;line-height:1.6;">
          Everything you need to turn raw meeting and walkthrough recordings into indexed, searchable, and actionable execution roadmaps.
        </p>
      </section>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:28px;">
        ${products.map((p, i) => `
          <div style="background:#f9fafb;border:1px solid #ededed;border-radius:20px;padding:32px;display:flex;flex-direction:column;transition:transform .2s ease,border-color .2s ease;" onmouseover="this.style.borderColor='#38c6ec';this.style.transform='translateY(-2px)'" onmouseout="this.style.borderColor='#ededed';this.style.transform=''">
            <div style="width:40px;height:40px;border-radius:10px;background:#000;color:#38c6ec;display:grid;place-items:center;font-weight:800;font-size:16px;margin-bottom:20px;">0${i+1}</div>
            <h3 style="font-size:22px;font-weight:700;margin:0 0 12px;letter-spacing:-0.02em;">${esc(p.name)}</h3>
            <p style="color:#555;font-size:15px;line-height:1.6;flex-grow:1;margin:0 0 24px;">${esc(p.description || '')}</p>
            <div style="display:flex;justify-content:space-between;align-items:center;padding-top:16px;border-top:1px solid #ededed;">
              <span style="font-weight:700;font-size:15px;color:#000;">${esc((p as any).price || 'Included')}</span>
              <a href="${path('contact/index.html')}" ${navAttrs('contact')} style="color:#0891b2;font-weight:700;font-size:14px;text-decoration:none;">Explore Feature →</a>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  if (page === 'about') {
    // Pricing Page (mapped to about in Web Radar)
    return `
      <section style="text-align:center;margin-bottom:60px;">
        <span style="display:inline-block;padding:4px 14px;border-radius:999px;background:rgba(56,198,236,0.12);color:#0891b2;font-size:13px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;margin-bottom:16px;">
          Predictable Pricing
        </span>
        <h1 style="font-size:clamp(2.2rem,4vw,3.6rem);font-weight:700;letter-spacing:-0.03em;margin:0 0 16px;">Simple, Transparent Plans for High-Speed Teams</h1>
        <p style="font-size:18px;color:#555;max-width:62ch;margin:0 auto;line-height:1.6;">
          Deploy Quantum² across your entire organization. Start free, upgrade when your team scales.
        </p>
      </section>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:28px;">
        <!-- Tier 1: Free -->
        <div style="background:#fff;border:1px solid #ededed;border-radius:24px;padding:36px;display:flex;flex-direction:column;">
          <h3 style="font-size:20px;font-weight:700;margin:0 0 8px;">Starter Free</h3>
          <p style="font-size:14px;color:#666;margin:0 0 24px;">For solo builders and fast async briefs.</p>
          <div style="font-size:42px;font-weight:800;letter-spacing:-0.03em;margin-bottom:24px;">$0 <span style="font-size:16px;font-weight:500;color:#888;">/ mo</span></div>
          <ul style="list-style:none;padding:0;margin:0 0 32px;display:grid;gap:12px;font-size:14px;color:#444;">
            <li>✓ Up to 25 recordings per month</li>
            <li>✓ 720p HD cloud video export</li>
            <li>✓ Basic transcript search</li>
            <li>✓ 1-click shareable links</li>
          </ul>
          <a class="btn" style="background:#000;color:#fff;border-radius:17px;font-weight:700;margin-top:auto;" href="${path('contact/index.html')}" ${navAttrs('contact')}>Get Started</a>
        </div>

        <!-- Tier 2: Pro -->
        <div style="background:#000;color:#fff;border:2px solid #38c6ec;border-radius:24px;padding:36px;display:flex;flex-direction:column;position:relative;box-shadow:0 12px 36px rgba(56,198,236,0.18);">
          <div style="position:absolute;top:-12px;right:24px;background:#38c6ec;color:#000;font-size:11px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;padding:4px 12px;border-radius:12px;">POPULAR CHOICE</div>
          <h3 style="font-size:20px;font-weight:700;margin:0 0 8px;color:#fff;">Pro Team</h3>
          <p style="font-size:14px;color:#aaa;margin:0 0 24px;">For scaling product & engineering teams.</p>
          <div style="font-size:42px;font-weight:800;letter-spacing:-0.03em;margin-bottom:24px;color:#fff;">$19 <span style="font-size:16px;font-weight:500;color:#888;">/ user / mo</span></div>
          <ul style="list-style:none;padding:0;margin:0 0 32px;display:grid;gap:12px;font-size:14px;color:#ccc;">
            <li>✓ Unlimited 4K HDR screen recordings</li>
            <li>✓ Quantum² Key Outcome & Action Item extraction</li>
            <li>✓ Multi-speaker voiceprint separation</li>
            <li>✓ Linear, Jira, Notion & Slack integrations</li>
            <li>✓ 90-day searchable history</li>
          </ul>
          <a class="btn" style="background:#38c6ec;color:#000;border-radius:17px;font-weight:800;margin-top:auto;" href="${path('contact/index.html')}" ${navAttrs('contact')}>Upgrade to Pro</a>
        </div>

        <!-- Tier 3: Enterprise -->
        <div style="background:#fff;border:1px solid #ededed;border-radius:24px;padding:36px;display:flex;flex-direction:column;">
          <h3 style="font-size:20px;font-weight:700;margin:0 0 8px;">Enterprise</h3>
          <p style="font-size:14px;color:#666;margin:0 0 24px;">For regulated industries and large orgs.</p>
          <div style="font-size:42px;font-weight:800;letter-spacing:-0.03em;margin-bottom:24px;">Custom</div>
          <ul style="list-style:none;padding:0;margin:0 0 32px;display:grid;gap:12px;font-size:14px;color:#444;">
            <li>✓ Dedicated on-premise VPC or private cloud</li>
            <li>✓ Custom fine-tuned semantic extraction models</li>
            <li>✓ SAML 2.0 SSO, SCIM & granular audit logs</li>
            <li>✓ SOC2 Type II & HIPAA compliance contracts</li>
            <li>✓ 99.99% uptime SLA & dedicated solution architect</li>
          </ul>
          <a class="btn" style="background:#000;color:#fff;border-radius:17px;font-weight:700;margin-top:auto;" href="${path('contact/index.html')}" ${navAttrs('contact')}>Contact Enterprise Desk</a>
        </div>
      </div>
    `;
  }

  // Default: FAQ & Contact Page
  return `
    <section style="text-align:center;margin-bottom:60px;">
      <span style="display:inline-block;padding:4px 14px;border-radius:999px;background:rgba(56,198,236,0.12);color:#0891b2;font-size:13px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;margin-bottom:16px;">
        FAQ & Support
      </span>
      <h1 style="font-size:clamp(2.2rem,4vw,3.6rem);font-weight:700;letter-spacing:-0.03em;margin:0 0 16px;">Got Questions? We Have Answers.</h1>
      <p style="font-size:18px;color:#555;max-width:62ch;margin:0 auto;line-height:1.6;">
        Find clear insights into how Quantum² secures your screen recordings, structures meetings, and accelerates workflows.
      </p>
    </section>

    <div style="display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,0.8fr);gap:48px;align-items:start;">
      <!-- FAQ Accordion -->
      <div style="display:flex;flex-direction:column;gap:16px;">
        <details style="background:#f9fafb;border:1px solid #ededed;border-radius:16px;padding:20px 24px;" open>
          <summary style="font-size:17px;font-weight:700;cursor:pointer;outline:none;">How does Quantum² parse screen recordings without manual tagging?</summary>
          <p style="margin:14px 0 0;font-size:15px;color:#555;line-height:1.7;">
            Quantum² runs asynchronous multi-modal neural pipelines. It combines local optical character recognition (OCR) on displayed software with diarized acoustic language models, extracting decisions and key metrics directly into the Outcome Review panel.
          </p>
        </details>

        <details style="background:#f9fafb;border:1px solid #ededed;border-radius:16px;padding:20px 24px;">
          <summary style="font-size:17px;font-weight:700;cursor:pointer;outline:none;">Is my proprietary screen and audio data kept secure and private?</summary>
          <p style="margin:14px 0 0;font-size:15px;color:#555;line-height:1.7;">
            Yes. Quantum² employs end-to-end AES-256 encryption at rest and TLS 1.3 in transit. We maintain a zero-retention guarantee for AI training—your proprietary screen frames and audio tracks are never used to train public models.
          </p>
        </details>

        <details style="background:#f9fafb;border:1px solid #ededed;border-radius:16px;padding:20px 24px;">
          <summary style="font-size:17px;font-weight:700;cursor:pointer;outline:none;">Which collaboration platforms does Quantum² integrate with?</summary>
          <p style="margin:14px 0 0;font-size:15px;color:#555;line-height:1.7;">
            Native bilateral sync is available for Linear, Jira, GitHub Issues, Slack, Notion, and Google Workspace. Action items created in Quantum² appear in your project boards in under two seconds.
          </p>
        </details>

        <details style="background:#f9fafb;border:1px solid #ededed;border-radius:16px;padding:20px 24px;">
          <summary style="font-size:17px;font-weight:700;cursor:pointer;outline:none;">What video resolutions and operating systems are supported?</summary>
          <p style="margin:14px 0 0;font-size:15px;color:#555;line-height:1.7;">
            Quantum² runs natively on macOS (Apple Silicon & Intel) and Windows 11. It supports 1080p, 1440p, 4K UHD, and ultra-wide monitor aspect ratios at up to 60fps.
          </p>
        </details>
      </div>

      <!-- Contact / Inquiry Form -->
      <div style="background:#f9fafb;border:1px solid #ededed;border-radius:24px;padding:36px;">
        <h3 style="font-size:22px;font-weight:700;margin:0 0 8px;">Direct Support Inquiry</h3>
        <p style="font-size:14px;color:#666;margin:0 0 24px;">Our engineering team responds to all inquiries within 4 business hours.</p>

        <form style="display:flex;flex-direction:column;gap:16px;" onsubmit="event.preventDefault();alert('Thank you! Your inquiry has been dispatched to Quantum² support.');this.reset();">
          <div>
            <label style="display:block;font-size:13px;font-weight:700;margin-bottom:6px;">Your Name</label>
            <input type="text" required placeholder="Alex Mercer" style="width:100%;padding:12px 14px;border:1px solid #ddd;border-radius:10px;font-family:inherit;font-size:14px;outline:none;">
          </div>
          <div>
            <label style="display:block;font-size:13px;font-weight:700;margin-bottom:6px;">Work Email</label>
            <input type="email" required placeholder="alex@company.com" style="width:100%;padding:12px 14px;border:1px solid #ddd;border-radius:10px;font-family:inherit;font-size:14px;outline:none;">
          </div>
          <div>
            <label style="display:block;font-size:13px;font-weight:700;margin-bottom:6px;">Message or Question</label>
            <textarea rows="4" required placeholder="How can our screen intelligence engine help your team?" style="width:100%;padding:12px 14px;border:1px solid #ddd;border-radius:10px;font-family:inherit;font-size:14px;outline:none;"></textarea>
          </div>
          <button type="submit" class="btn" style="background:#000;color:#fff;border-radius:17px;font-weight:700;width:100%;margin-top:8px;">Send Inquiry →</button>
        </form>
      </div>
    </div>
  `;
}
